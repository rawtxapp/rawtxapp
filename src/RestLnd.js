/* @flow */
/**
 * LND rest client implementation.
 */

/*
 * The standard fetch that's included in react-native doesn't allow adding
 * additional ssl certs, so implement a different version with self signed 
 * ssl support.
 */
import { encodeBase64, fetch } from "./NativeRtxModule.js";
import { timeout, convertErrorToStr } from "./Utils.js";

type LNDState = "seed" | "password" | "unlocked" | "unknown";
class LndApi {
  host: string;
  port: string;
  pathPrefix: string;
  TAG: string;
  adminMacaroon: string;
  constructor(
    host: string = "localhost",
    port: string = "8080",
    pathPrefix: string = "/v1"
  ) {
    this.host = host;
    this.port = port;
    this.pathPrefix = pathPrefix;
    this.TAG = "LndApi";
    this.adminMacaroon = "";
  }

  headers = () => {
    let headers = {};
    if (this.adminMacaroon) {
      headers["Grpc-Metadata-macaroon"] = this.adminMacaroon;
    }
    return headers;
  };

  setAdminMacaroon = (adminMacaroon: string) => {
    this.adminMacaroon = adminMacaroon;
  };

  url = (path: string, queryParams: ?string) => {
    if (!path.startsWith("/")) {
      path = "/" + path;
    }
    let finalPath =
      "https://" + this.host + ":" + this.port + this.pathPrefix + path;
    if (queryParams) {
      finalPath += "?" + queryParams;
    }
    return finalPath;
  };

  log = (...args: any[]) => {
    if (__DEV__) {
      // console.log(this.TAG, ...args);
    }
  };

  genericGetJson = async (urlIn: string) => {
    try {
      const url = this.url(urlIn);
      const response = await fetch({ url, headers: this.headers() });
      const json = JSON.parse(response["bodyString"]);
      return json;
    } catch (error) {
      this.log("for url: " + urlIn + error);
      throw error;
    }
  };

  genericDeleteJson = async (urlIn: string, queryParams: string) => {
    try {
      const url = this.url(urlIn, queryParams);
      const response = await fetch({
        url,
        method: "delete",
        headers: this.headers()
      });
      const json = JSON.parse(response["bodyString"]);
      return json;
    } catch (error) {
      this.log("for url: " + urlIn + error);
      throw error;
    }
  };

  genericPostJson = async (urlIn: string, jsonIn: Object) => {
    try {
      const url = this.url(urlIn);
      const response = await fetch({
        url,
        method: "post",
        jsonBody: JSON.stringify(jsonIn),
        headers: this.headers()
      });
      const json = JSON.parse(response["bodyString"]);
      return json;
    } catch (error) {
      this.log("for url: " + urlIn + error);
      throw error;
    }
  };

  getInfo = async () => {
    this.log("getting info");
    return await this.genericGetJson("getinfo");
  };

  genSeed = async () => {
    this.log("generating seed");
    return await this.genericGetJson("genseed");
  };

  initwallet = async (cipher: string, password: string) => {
    this.log("initializing wallet");
    return await this.genericPostJson("initwallet", {
      wallet_password: await encodeBase64(password),
      cipher_seed_mnemonic: cipher
    });
  };

  unlockwallet = async (password: string) => {
    this.log("unlocking wallet");
    try {
      const result = await this.genericPostJson("unlockwallet", {
        wallet_password: await encodeBase64(password)
      });
      if (result.error != "invalid passphrase for master public key") {
        // wait until getinfo works or at most 30 seconds
        for (let i = 0; i < 30; i++) {
          try {
            this.log("trying to getinfo");
            await this.getInfo();
            return {};
          } catch (err) {
            this.log("failed getinfo");
            await timeout(1000);
          }
        }
        return {
          error:
            "It looks like we weren't able to open the wallet (" +
            result.error +
            "), if you see a notification on the top, try closing and" +
            " reopening the app!"
        };
      } else {
        return result;
      }
    } catch (err) {
      return { error: convertErrorToStr(err) };
    }
  };

  // response could be {}
  balanceBlockchain = async () => {
    this.log("getting blockchain balance");
    return await this.genericGetJson("balance/blockchain");
  };

  balanceChannels = async () => {
    this.log("getting channels balance");
    return await this.genericGetJson("balance/channels");
  };

  newaddress = async () => {
    this.log("generating new address");
    return await this.genericGetJson("newaddress");
  };

  peers = async () => {
    this.log("getting peers");
    return await this.genericGetJson("peers");
  };

  addPeers = async (pubkey: string, host: string, perm: boolean = false) => {
    this.log("adding peer: ", pubkey, host, perm);
    try {
      await this.genericPostJson("peers", {
        addr: {
          pubkey,
          host
        },
        perm
      });
    } catch (e) {}

    for (let i = 0; i < 3; i++) {
      try {
        // Sometimes getNodeInfo doesn't include the peer, so check peer list to
        // overcome that.
        const peerIncludes = (await this.peers())["peers"]
          .map(a => a.pub_key)
          .includes(pubkey);
        if (peerIncludes) return {};
        const { node } = await this.getNodeInfo(pubkey);
        if (node.pub_key) return {};
      } catch (e) {
        await timeout(3 * 1000);
      }
    }
    return { error: "couldn't connect to node" };
  };

  addPeersAddr = async (addr: string) => {
    const splitted = addr.split("@").filter(String);
    if (splitted.length < 2) {
      throw new Error("Addresses doesn't have 2 components (pubkey+ip)!");
    }
    return await this.addPeers(splitted[0], splitted[1]);
  };

  openChannel = async (channelRequest: Object) => {
    this.log("opening channel to: ", channelRequest.node_pubkey_string);
    if (channelRequest.node_pubkey_string.includes("@")) {
      channelRequest.node_pubkey_string = channelRequest.node_pubkey_string.split(
        "@"
      )[0];
    }
    channelRequest.private = true;
    return await this.genericPostJson("channels", channelRequest);
  };

  removeLightning_ = (payreq: string) => {
    const l = "lightning:";
    if (payreq.startsWith(l)) {
      return payreq.substring(l.length);
    }
    return payreq;
  };

  decodepayreq = async (payreq: string) => {
    // TODO: make sure this doesn't open a loophole or security vulnerability
    // since payreq is coming from a potential attacker.
    this.log("decoding payreq: ", payreq);
    return await this.genericGetJson("payreq/" + this.removeLightning_(payreq));
  };

  sendpaymentPayreq = async (payreq: string) => {
    this.log("paying payreq: ", payreq);
    return await this.genericPostJson("channels/transactions", {
      payment_request: this.removeLightning_(payreq)
    });
  };

  graph = async () => {
    this.log("getting graph information");
    return await this.genericGetJson("graph");
  };

  graphInfo = async () => {
    this.log("getting graph summary information");
    return await this.genericGetJson("graph/info");
  };

  channels = async () => {
    this.log("getting channel information");
    return await this.genericGetJson("channels");
  };

  pendingChannels = async () => {
    this.log("getting pending channel information");
    return await this.genericGetJson("channels/pending");
  };

  // chan_point format => tx_id:out_ix
  closeChannel = async (chan_point: string, force_close: boolean = false) => {
    const split = chan_point.split(":");
    const chan_point_tx_id = split[0];
    const chan_point_out_ix = split[1];
    this.log("closing channel: ", chan_point_tx_id, chan_point_out_ix);

    return await this.genericDeleteJson(
      "channels/" + chan_point_tx_id + "/" + chan_point_out_ix,
      force_close ? "force=true" : ""
    );
  };

  addInvoiceSimple = async (memo: string, amount_sat: string) => {
    this.log("adding simple invoice: ", memo, ", ", amount_sat);
    return await this.genericPostJson("invoices", {
      memo,
      value: parseInt(amount_sat),
      private: true
    });
  };

  getNodeInfo = async (pub_key: string) => {
    this.log("getting node info for ", pub_key);
    return await this.genericGetJson("graph/node/" + pub_key);
  };

  getPayments = async () => {
    this.log("getting payments");
    return await this.genericGetJson("payments");
  };

  getInvoices = async () => {
    this.log("getting invoices");
    return await this.genericGetJson("invoices");
  };

  sendTransactionBlockchain = async (addr: string, amount: string) => {
    this.log("sending btc (blockchain) to ", addr);
    return await this.genericPostJson("transactions", {
      addr,
      amount
    });
  };

  // Convenience method to determine the state of LND.
  determineState = async (): Promise<LNDState> => {
    this.log("determining lnd state");

    // check if we are at genseed stage
    try {
      const seed = await this.genSeed();
      if (seed.cipher_seed_mnemonic) {
        return "seed";
      } else if (seed.error.includes("already exists")) {
        return "password";
      }
    } catch (err) {}

    try {
      const getinfo = await this.getInfo();
      if (getinfo.identity_pubkey) {
        return "unlocked";
      }
    } catch (err) {}

    return "unknown";
  };
}

export default new LndApi();
export type { LndApi, LNDState };
