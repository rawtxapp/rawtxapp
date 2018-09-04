// Api is rawtx api helpers.
export default class Api {
  constructor(coin, network) {
    this.coin = coin;
    this.network = network;
  }

  url = path => {
    return "https://api.rawtx.com" + path;
  };

  log = (...args) => {
    if (__DEV__) {
      console.log("Api", ...args);
    }
  };

  blockCount = async () => {
    try {
      const r = await fetch(
        this.url("/" + this.coin + "/" + this.network + "/block_count")
      );
      const j = await r.json();
      return j.count;
    } catch (err) {
      return 0;
    }
  };
}
