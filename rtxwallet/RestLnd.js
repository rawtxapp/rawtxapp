/**
 * LND rest client implementation.
 */

/*
 * The standard fetch that's included in react-native doesn't allow adding
 * additional ssl certs, so implement a different version with self signed 
 * ssl support.
 */
import { fetch, encodeBase64 } from "./NativeRtxModule.js";
import { timeout } from "./Utils.js";

class LndApi {
  constructor(host = "localhost", port = "8080", pathPrefix = "/v1") {
    this.host = host;
    this.port = port;
    this.pathPrefix = pathPrefix;
    this.TAG = "LndApi";
  }

  url = path => {
    if (!path.startsWith("/")) {
      path = "/" + path;
    }
    return "https://" + this.host + ":" + this.port + this.pathPrefix + path;
  };

  log = (...args) => {
    console.log(this.TAG, ...args);
  };

  genericGetJson = async urlIn => {
    try {
      this.log("urlIn: " + urlIn);
      const url = this.url(urlIn);
      const response = await fetch({ url });
      this.log(response);
      const json = JSON.parse(response["bodyString"]);
      return json;
    } catch (error) {
      this.log("for url: " + urlIn + error);
      throw error;
    }
  };

  genericPostJson = async (urlIn, jsonIn) => {
    try {
      const url = this.url(urlIn);
      const response = await fetch({
        url,
        method: "post",
        jsonBody: JSON.stringify(jsonIn)
      });
      this.log(response);
      const json = JSON.parse(response["bodyString"]);
      return json;
    } catch (error) {
      console.error("for url: " + urlIn + error);
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

  initwallet = async (cipher, password) => {
    this.log("initializing wallet");
    return await this.genericPostJson("initwallet", {
      wallet_password: await encodeBase64(password),
      cipher_seed_mnemonic: cipher
    });
  };

  unlockwallet = async password => {
    this.log("unlocking wallet");
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

  addPeers = async (pubkey, host, perm = true) => {
    this.log("adding peer: ", pubkey, host, perm);
    return await this.genericPostJson("peers", {
      addr: {
        pubkey,
        host
      },
      perm
    });
  };

  openChannel = async channelRequest => {
    this.log("opening channel to: ", channelRequest.node_pubkey_string);
    return await this.genericPostJson("channels", channelRequest);
  };

  removeLightning_ = payreq => {
    const l = "lightning:";
    if (payreq.startsWith(l)) {
      return payreq.substring(l.length);
    }
    return payreq;
  };

  decodepayreq = async payreq => {
    // TODO: make sure this doesn't open a loophole or security vulnerability
    // since payreq is coming from a potential attacker.
    this.log("decoding payreq: ", payreq);
    return await this.genericGetJson("payreq/" + this.removeLightning_(payreq));
  };

  sendpaymentPayreq = async payreq => {
    this.log("paying payreq: ", payreq);
    return await this.genericPostJson("channels/transactions", {
      payment_request: this.removeLightning_(payreq)
    });
  };
}

export default new LndApi();
