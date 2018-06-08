// docs: https://github.com/facebook/react-native/blob/235b16d93287061a09c4624e612b5dc4f960ce47/Libraries/vendor/emitter/EventEmitter.js
import { Platform } from "react-native";
import EventEmitter from "EventEmitter";

export default class WalletListener {
  constructor(restLnd) {
    this.eventListener = new EventEmitter();
    this.watching_ = false;
    this.lastResponse = {};
    this.failedRest = {};
    // Sometimes if a call takes long time we could end up in a situation
    // where the next call is made before the 1st one is finished.
    // This keeps track of methods currently running and skips
    // a rpc call if there's already one in progress.
    this.runningMethod = {};
    this.restLnd = restLnd;

    // TODO:
    // On iOS, we have to run the UI to be able to run lnd,
    // which means that while it's syncing, etc, the UI is constantly polling
    // lnd which is wasting a lot of battery/overheating.
    // Until we switch to streaming, slow down polling in iOS at the expense
    // of the UI getting slightly out of sync with lnd.
    let pollingMultiplier = 1;
    if (Platform.OS == "ios") {
      pollingMultiplier = 2.5;
    }

    // Adds internal function for watchers
    // Example watchgetInfo, will call getInfo repeatedly and emit events.
    const watchers = [
      {
        method: "GetInfo",
        api: restLnd.getInfo,
        interval: 3000 * pollingMultiplier
      },
      {
        method: "BalanceChannels",
        api: restLnd.balanceChannels,
        interval: 2000 * pollingMultiplier
      },
      {
        method: "BalanceBlockchain",
        api: restLnd.balanceBlockchain,
        interval: 2000 * pollingMultiplier
      },
      {
        method: "GraphInfo",
        api: restLnd.graphInfo,
        interval: 30000 * pollingMultiplier
      },
      {
        method: "PendingChannels",
        api: restLnd.pendingChannels,
        interval: 3000 * pollingMultiplier
      },
      {
        method: "Channels",
        api: restLnd.channels,
        interval: 5000 * pollingMultiplier
      }
    ];
    for (let i = 0; i < watchers.length; i++) {
      const watcher = watchers[i];
      this["watch" + watcher.method] = async () => {
        const method = watcher.method;
        try {
          if (this.runningMethod[method]) {
            console.log("not calling running method: " + method);
            return;
          }
          this.runningMethod[method] = true;
          const res = await watcher.api();
          this.runningMethod[method] = false;
          this.resetFail(method);
          // If we just emit all the new responses even when there's no change,
          // it will create a lot of re-renders of react components, so
          // compare with existing response before emitting the events.
          const lastResponse = this.getLastResponse(method);
          if (
            lastResponse &&
            JSON.stringify(lastResponse) == JSON.stringify(res)
          ) {
            // JSON.stringify check is essentially a hack, but it works
            // because the server will always response with the same format back.
            // If we reach here, it means the responses didn't change, so shortcircuit
            // the update.
            console.log("Skipping WalletListener emit!");
            return;
          }
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
      this.lastResponse = {};
      this.watching_ = false;
    };
  }

  // Keep track of failures and number of time they happen.
  addFail = (method, error) => {
    this.failedRest[method] = {
      error
    };
    this.runningMethod[method] = false;
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
