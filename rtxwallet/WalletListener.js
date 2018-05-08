// docs: https://github.com/facebook/react-native/blob/235b16d93287061a09c4624e612b5dc4f960ce47/Libraries/vendor/emitter/EventEmitter.js
import EventEmitter from "EventEmitter";

export default class WalletListener {
  constructor(restLnd) {
    this.eventListener = new EventEmitter();
    this.watching_ = false;
    this.lastResponse = {};
    this.failedRest = {};
    this.restLnd = restLnd;

    // Adds internal function for watchers
    // Example watchgetInfo, will call getInfo repeatedly and emit events.
    const watchers = [
      { method: "GetInfo", api: restLnd.getInfo, interval: 2000 },
      {
        method: "BalanceChannels",
        api: restLnd.balanceChannels,
        interval: 1000
      },
      {
        method: "BalanceBlockchain",
        api: restLnd.balanceBlockchain,
        interval: 1000
      },
      { method: "GraphInfo", api: restLnd.graphInfo, interval: 3000 },
      {
        method: "PendingChannels",
        api: restLnd.pendingChannels,
        interval: 2000
      },
      {
        method: "Channels",
        api: restLnd.channels,
        interval: 2000
      }
    ];
    for (let i = 0; i < watchers.length; i++) {
      const watcher = watchers[i];
      this["watch" + watcher.method] = async () => {
        const method = watcher.method;
        try {
          const res = await watcher.api();
          this.resetFail(method);
          this.updateLastResponse(method, res);
          this.eventListener.emit(method, res);
        } catch (error) {
          this.addFail(method, error);
        }
      };
    }

    // Add external functions that class user can call
    // to listen whichever event they want.
    for (let i = 0; i < watchers.length; i++) {
      const listener = watchers[i];
      this["listenTo" + listener.method] = (fn, immediate = true) => {
        const listenerResult = this.eventListener.addListener(
          listener.method,
          fn
        );
        if (immediate) {
          const lastResponse = this.getLastResponse(listener.method);
          if (lastResponse) {
            fn(lastResponse);
          }
        }
        return listenerResult;
      };
    }

    // Called when wallet is started.
    this.startWatching = () => {
      if (this.watching_) {
        return;
      }

      for (let i = 0; i < watchers.length; i++) {
        const watcher = watchers[i];
        this["watch" + watcher.method]();
        if (watcher.interval == -1) continue;
        this["watch" + watcher.method + "Interval_"] = setInterval(
          this["watch" + watcher.method],
          watcher.interval || 1000
        );
      }

      this.watching_ = true;
    };

    // Called when wallet is stopped.
    this.stopWatching = () => {
      if (!this.watching_) {
        return;
      }
      for (let i = 0; i < watchers.length; i++) {
        const watcher = watchers[i];
        clearInterval(this["watch" + watcher.method + "Interval_"]);
      }
      this.watching_ = false;
    };
  }

  // Keep track of failures and number of time they happen.
  addFail = (method, error) => {
    this.failedRest[method] = {
      error
    };
    this.failedRest[method]["count"] = this.failedRest[method].count + 1 || 1;
  };

  resetFail = method => {
    this.failedRest[method] = {};
  };

  // Keep last response, so that it can be send immediately when
  // a new client starts listening for an event.
  updateLastResponse = (method, response) => {
    this.lastResponse[method] = response;
  };

  getLastResponse = method => {
    if (this.lastResponse.hasOwnProperty(method)) {
      return this.lastResponse[method];
    }
  };

  // the graph call is very heavy, so we want to do it only once every 5 minutes
  // the only problem is the timers don't allow timing events more than
  // 1 minute. This method will fetch the graph on the first call and
  // return the last graph response if it was less than 5 minutes ago, if more
  // it will fetch it again.
  getLastGraph = async () => {
    if (
      this.lastGraphTime_ &&
      Date.now() - this.lastGraphTime_ < 5 * 60 * 1000 &&
      this.getLastResponse("Graph")
    ) {
      return this.getLastResponse("Graph");
    }

    const graph = await this.restLnd.graph();
    this.updateLastResponse("Graph", graph);
    this.lastGraphTime_ = Date.now();
    return graph;
  };
}
