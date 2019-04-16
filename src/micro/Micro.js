/* @flow */
import AsyncStorage from "@react-native-community/async-storage";
import typeof EventEmitter from "EventEmitter";

// For initial release, only allow up to 10k sat
// allowance one time (the lapp can ask for more
// even if it has a positive allowance), but
// an app can't have more than this limit
// at any given time.
const BASE_LAPP_ALLOWANCE_LIMIT = 10000;

const LAPP_STORE_PREFIX = "@Micro:lapp:";

export const EVENT_NEW_PAYMENT = "microNewPayment";
export const EVENT_PAYMENT_SUCCESS = "microPaymentSuccess";
export const EVENT_PAYMENT_FAIL = "microPaymentFail";
// No status can happen when the payment timeouts, in that case, micro will wait
// a few seconds before querying lnd to verify payment and update. If it can't
// determine a status, we assume payment was successful and deduct it from an
// app's allowance. The reason for that is in case an attacker is finds a way
// of getting payments to timeout consistently, if we didn't decrement allowance
// they could potentially empty the wallet.
// TODO: switch over to streaming RPCs which would help.
export const EVENT_PAYMENT_NO_STATUS = "microPaymentNoStatus";

// MAX_MICRO_PAYMENT is the max amount (in satoshis) that the lapp can charge
// through the micro/allowance. If lapp tries to charge higher than this, micro
// will instead display a payment confirmation to the user instead of
// automatically paying the invoice.
const MAX_MICRO_PAYMENT = 100;

// MAX_MICRO_PENDING_PAYMENTS is the number of maximum pending payments a lapp
// can send, when a new payment is coming in pending is incremented and it's
// only decremented if the payment fails or succeeds.
// If the lapp tries to send more than this many payments at a time, the
// remaining ones will be dropped without feedback to the lapp.
const MAX_MICRO_PENDING_PAYMENTS = 3;

type Lapp = {
  id: string,
  name: string,
  description: string,
  pubkey: string
};

type LappStoreItem = {
  balance: number
};

class Micro {
  initialized: boolean;
  sendMessage: string => void;
  updateAllowanceTextFn: (string, ?[]) => void;
  showAllowanceAskToUser: number => Promise<void>;
  showPayInvoiceScreen: string => Promise<void>;
  lapp: Lapp;
  microEvents: EventEmitter;
  decodePaymentFn: string => Promise<Object>;
  // returns true if payment succeded
  payInvoiceFn: string => Promise<boolean>;
  pending: number;
  static cachedLapps: Lapp[];

  // keeping currentAllowance in memory helps us avoid race conditions since
  // JS is single-threaded.
  currentAllowance: number;

  constructor(
    lapp: Lapp,
    microEvents: EventEmitter,
    decodePaymentFn: string => Promise<Object>,
    payInvoiceFn: string => Promise<boolean>
  ) {
    this.initialized = false;
    this.lapp = lapp;
    this.microEvents = microEvents;
    this.decodePaymentFn = decodePaymentFn;
    this.payInvoiceFn = payInvoiceFn;
    this.currentAllowance = 0;
    this.pending = 0;
    this.getAppAllowanceFromDB();
  }

  log = (...c: mixed[]) => {
    if (__DEV__) {
      console.log("Micro", ...c);
    }
  };

  init = () => {
    if (this.sendMessage) {
      this.log("sending init message");
      this.sendMessage("initMicro");
    } else {
      throw new Error("Micro initialized before setting sendMessage.");
    }
  };

  // empty function, needs to be replaced with the setSendMessage call
  sendMessage = (..._: mixed[]) => {};

  setSendMessage = (sendMessageFn: string => void) => {
    this.log("setSendMessage");
    this.sendMessage = sendMessageFn;
  };

  setUpdateAllowanceTextFn = (updateAllowanceTextFn: (string, ?[]) => void) => {
    this.log("setUpdateAllowanceTextFn");
    this.updateAllowanceTextFn = updateAllowanceTextFn;
  };

  // showAllowanceAskToUser function is used for asking the user whether
  // or not they would allow the lapp to charge up to N satoshis
  // without asking.
  // It could potentially also make sure there's a payment route
  // to the app and ask the user whether they want to open a
  // channel to that app's node.
  setShowAllowanceAskToUser = (
    showAllowanceAskToUser: number => Promise<void>
  ): void => {
    this.log("setShowAllowanceAskToUser");
    this.showAllowanceAskToUser = showAllowanceAskToUser;
  };

  setShowPayInvoiceScreen = (
    showPayInvoiceScreen: string => Promise<void>
  ): void => {
    this.log("setShowPayInvoiceScreen");
    this.showPayInvoiceScreen = showPayInvoiceScreen;
  };

  // Returns how much this app is allowed to charge
  // in micro without showing a confirmation screen.
  getAppAllowanceFromDB = async (): Promise<number> => {
    if (!this.lapp || !this.lapp.id) return 0;
    try {
      const lappItemRaw: string = await AsyncStorage.getItem(
        LAPP_STORE_PREFIX + this.lapp.id
      );
      if (lappItemRaw) {
        const lappItem: LappStoreItem = JSON.parse(lappItemRaw);
        this.log("app's current allowance", lappItem.balance);
        this.currentAllowance = lappItem.balance;
        return parseInt(lappItem.balance);
      }
    } catch (err) {
      throw err;
    }
    return 0;
  };

  getCurrentAllowance = (): number => {
    return this.currentAllowance;
  };

  // returns true if allowed successfully.
  setAppAllowanceToDB = async (amtSat: number): Promise<boolean> => {
    if (!this.lapp || !this.lapp.id) return false;
    if (amtSat > BASE_LAPP_ALLOWANCE_LIMIT) return false;
    try {
      const item: LappStoreItem = { balance: amtSat };
      await AsyncStorage.setItem(
        LAPP_STORE_PREFIX + this.lapp.id,
        JSON.stringify(item)
      );
      this.log("updated app's allowance", amtSat);
      if (this.updateAllowanceTextFn) {
        this.updateAllowanceTextFn(amtSat.toString());
      }
      return true;
    } catch (e) {}
    return false;
  };

  sendAllowanceMessageToLapp = (newAllowanceAmount: number) => {
    if (this.initialized) {
      this.log("sending update appAllowance to lapp");
      this.sendMessage("appAllowance:" + newAllowanceAmount.toString());
    }
  };

  setCurrentAllowance = (allowance: number): void => {
    this.currentAllowance = allowance;
    this.setAppAllowanceToDB(allowance);
    this.sendAllowanceMessageToLapp(allowance);
  };

  // returns bool indicating whether the message was handled
  onReceivedMessage = async (data: string): Promise<boolean> => {
    // TODO: rate limit messages from the app,
    // ex: the app can't ask for appAllowance in an infinite loop, etc.
    // that could be a potential attack or bug in the lapp code.

    if (!Micro.isMessageSane(data)) {
      return false;
    }
    data = data.toLowerCase().trim();

    //
    // HANDLE LAPP INITIALIZATION
    //
    if (data == "initmicroack" && !this.initialized) {
      this.log("received init message");
      this.initialized = true;
      this.sendAllowanceMessageToLapp(this.currentAllowance);
      return true;
    }

    //
    // HANDLE LAPP ALLOWANCE QUERYING
    //
    if (this.initialized && data == "getappallowance") {
      this.log("app querying allowance");
      this.sendMessage(
        "appAllowance:" + (await this.getAppAllowanceFromDB()).toString()
      );
      return true;
    }

    //
    // HANDLE LAPP ALLOWANCE REQUEST
    //
    const askForAllowancePrefix = "askforallowance:";
    if (this.initialized && data.startsWith(askForAllowancePrefix)) {
      const amount = parseInt(data.substring(askForAllowancePrefix.length));
      this.log("app asking allowance", amount);
      const allowanceRequestPrefix = "allowancerequest:";
      if (!this.showAllowanceAskToUser) {
        this.log("couldn't ask user showAllowanceAskToUser not set");
        this.sendMessage(allowanceRequestPrefix + "refused");
        return true;
      }
      const userResponse = await this.showAllowanceAskToUser(amount);
      if (userResponse) {
        this.log("user response for allowance request", userResponse);
        const allowanceResponse = await this.setAppAllowanceToDB(amount);
        this.log(
          "allowanceResponse response for allowance request",
          allowanceResponse
        );
        if (allowanceResponse) {
          this.sendMessage(allowanceRequestPrefix + "allowed");
        } else {
          this.sendMessage(allowanceRequestPrefix + "refused");
        }
        return true;
      } else {
        this.sendMessage(allowanceRequestPrefix + "refused");
        return true;
      }
    }

    //
    // HANDLE PAYMENT
    //
    const lightningPrefix = "lightning:";
    if (data.startsWith(lightningPrefix)) {
      const handled = await this.handlePayment(data);
      return handled;
    }

    return false;
  };

  handlePayment = async (data: string): Promise<boolean> => {
    if (this.pending > MAX_MICRO_PENDING_PAYMENTS) {
      // drop payment request if we have more than max pending requests already.
      return false;
    }

    this.log("handling payment", data);
    const decoded = await this.decodePaymentFn(data);

    // Security check, the lapp loaded in the webview can't request payments
    // to be sent to a pubkey other than the pubkey that was declared in the
    // lapp's object. This is to prevent a hacker from potentially hijacking
    // a trusted app and directing payments to their own nodes.
    if (!decoded.destination || decoded.destination != this.lapp.pubkey) {
      this.log(
        "payment destination different than lapp pubkey",
        decoded && decoded.destination,
        this.lapp.pubkey
      );
      return false;
    }

    if (
      this.payInvoiceFn &&
      decoded.num_satoshis <= MAX_MICRO_PAYMENT &&
      decoded.num_satoshis < this.currentAllowance
    ) {
      this.log("trying automatic payment", data);
      this.pending++;
      this.microEvents.emit(EVENT_NEW_PAYMENT, data, decoded);
      try {
        let payment_result = await this.payInvoiceFn(data);
        this.log("automatic payment result", data, payment_result);
        if (payment_result) {
          this.microEvents.emit(EVENT_PAYMENT_SUCCESS, data);
          this.setCurrentAllowance(
            this.getCurrentAllowance() - decoded.num_satoshis
          );
          this.pending--;
          return true;
        }
      } catch (e) {}
      this.microEvents.emit(EVENT_PAYMENT_FAIL, data);
      this.pending--;
      return false;
    } else if (this.showPayInvoiceScreen) {
      this.log("showing payinvoice screen");
      this.showPayInvoiceScreen(data);
      return false;
    }
    return false;
  };

  static async getLapps(coin: "bitcoin", network: "testnet" | "mainnet") {
    const fetchFromRawtx = async () => {
      const url = "https://lapps.rawtx.com/" + coin + "_" + network + ".json";
      try {
        const remote = await fetch(url);
        let parsed = await remote.json();
        parsed = parsed || [];
        if (__DEV__ && false) {
          // In dev, insert localhost dev app at the beginning as a convenience.
          let host = "10.0.2.2"; // for emulator, change to localhost on device
          parsed.unshift({
            id: "localhost",
            // ICON isn't required.
            icon: "http://" + host + ":3000/icon.png",
            name: "DEV:localhost",
            description: "localhost development",
            // CHANGE PUBKEY TO BE YOURS!
            pubkey:
              "03c4698fd8a00bff6244ad4fe8d5a95cb103f113cb760b00b9cd2ba7c3ab3c63aa",
            // CHANGE ADDRESS TO BE YOURS!
            address: "159.89.221.66:9735",
            url: "http://" + host + ":3000",
            microEnabled: true
          });
        }
        return parsed;
      } catch (err) {
        return [];
      }
    };

    const fetching = fetchFromRawtx();

    if (this.cachedLapps) {
      fetching.then(fetched => {
        // Update the cache.
        this.cachedLapps = fetched;
      });
      return this.cachedLapps;
    } else {
      // Block until we receive the fetch results.
      const fetched = await fetching;
      this.cachedLapps = fetched;
      return fetched;
    }
  }

  // An attacker could use messages to exploit the wallet, in theory,
  // this shouldn't be possible since the messages are simply strings,
  // but just to be safe, we make sure incoming messages are "safe" before
  // continuing with micro or payment execution.
  // Safe means: only numbers, letters or ":" character (used for example in
  // "lightning:...").
  static isMessageSane(message: string) {
    const stripped = message.replace(/[a-zA-Z0-9:]/gm, "");
    return stripped.length == 0;
  }
}

export default Micro;
