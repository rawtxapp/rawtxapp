## High level overview
* Uses lnd as a daemon/library because it fully conforms to the BOLT
specifications and is easy to cross-compile and run on mobile platforms.
* rawtx is cross compiled using [xgo](https://github.com/karalabe/xgo).
**xgo** brings up a **docker** image with all the build tools required for compiling
Go into different platforms. It also supports building an
**.aar** package for Android and a **.framework** package for iOS.
* The UI/app is built using [react-native](https://github.com/facebook/react-native),
which gives us the performance of a native app with development convenience of Javascript.
* Architecture looks like: **react-native -> (glue) -> lnd**
    * glue here is the native code (Java on Android and objC on iOS) that allows
    react-native to manage and call lnd. glue let's us:
        * start, stop and query the state of lnd,
        * write, read files, scan QR codes,
        * make REST calls to lnd,
        * on Android, manages the background lnd process.
* To support multiple wallets, the app has a **wallet.conf** that keeps track of all wallets. multi-wallet
support from the very beginning sets user expectations and allows things like:
    * running Bitcoin and Litecoin(when ready) wallets **side-by-side**,
    * running multiple Bitcoin wallets (testnet or mainnet when ready),
    * allows adding **remote wallets**(coming soon) for those running their own nodes,
        * also will enable monitoring of multiple remote nodes when prometheus is merged into lnd,
    * allows **shipping 2 binary versions** of lnd (ex: lnd upgrades from 0.4.2 to 0.5),
        * it's possible that there will be backwards-incompatible changes, by having 2 binaries
        we can use the new binary for new wallets and old binary for existing wallets, prompting the user
        to switch funds,
        * makes it possible to ship a new lnd version and detect regression on newly created wallets, etc.
    * allows having additional implementations like **c-lightning** for some wallets.
* On Android, the lnd daemon is **isolated** in it's own process, so it's easier to manage
and when it hangs or shutdowns, the whole process is removed, keeping the app's own
process "clean" and makes it more difficult for native code to crash the app.
* On iOS, lnd runs in the **same process** as the main app and there are far more restrictions
on memory/cpu/processes, so when the wallet is closed, the user can't reopen another wallet
without quitting the app.