# rawtx - lightning network wallet
rawtx is an open-source lightning network wallet powered by [lnd](https://github.com/lightningnetwork/lnd)
which allows you to send and receive Bitcoins both on blockchain and lightning network.

Here's what it looks like:
<br>
<img src="https://rawtx.com/assets/android-app-screenshot.png" height="400">

You can get it from [Play Store on Android](https://play.google.com/store/apps/details?id=com.rtxwallet)
or [App Store for iOS](include_link).

If you're interested in compiling it from scratch, would like to know how it works or looking
to contribute, please keep reading.

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

**gomobile** is a common option used by other developers for cross-compiling,
we believe **xgo is better** because:
1. gomobile is **experimental** with no end-user support, few documentation, xgo is simply
a docker image and tool to run a cgo cross-compilation (cgo is part
of golang, used by many big/important projects, also used internally
by gomobile), so xgo will be more predictable and reliable,
1. gomobile requires **modifications** to lnd's codebase in order to compile 
(ex: gomobile can't export anything in *main* package). With xgo,
we can just *git pull* and compile without any **new** modifications to lnd's
codebase.
1. gomobile tries to export every functions it finds so that the Go
project can be used as a library on mobile, this is both **unnecessary and
problematic**. Unnecessary because we run lnd as a daemon, therefore we don't need
access to it's internals and problematic because not everything is exportable
to mobile (ex: if it comes across a big integer, it doesn't have an equivalent
on JVM, it will fail with unsupported type).


## Building from source
**Please note:** when you compile and run from the development
version from the source code by default, there is a lot of overhead.
The profile server will be open on port :6060, lnd log levels
will be set to info and app logs will be set at the info level.
This will lead to performance problems and overheating of your phone,
if you don't want to develop but still compile from source code,
look into documentation on how to build a release build of
react-native project.

If you run into libfishhook.a related errors on XCode, patch:
https://github.com/facebook/react-native/pull/19579
into node_modules/react-native/ code.

If you run into config.h not found:
https://github.com/facebook/react-native/issues/14382

### 1. Requirements
You need to install:
* [react-native](http://facebook.github.io/react-native/docs/getting-started.html)
* [golang 1.10](https://golang.org/doc/install)
* [docker](https://docs.docker.com/install/)
* [lnd](https://github.com/lightningnetwork/lnd/blob/master/docs/INSTALL.md)
* [xgo](https://github.com/karalabe/xgo)
* [npm](https://www.npmjs.com/get-npm)

### 2. Cross compiling lnd

1. Go to lnd folder
1. Apply the rawtx patch (`lnd.patch` in this repo, this exports *hooks* which allows us to start/stop lnd)
    ```
    git apply lnd.patch
    ```
    **Note:** if you run into problems with the patch, you can always use the *newmerge* branch
    from our own fork of lnd: https://github.com/rawtxapp/lnd/tree/newmerge.
1. Depending on which platform you're targeting, compile using xgo:
    * **Android**, run:
    ```
    dep ensure && xgo -out rtx_export --targets=android/aar  ./
    ```
    This will produce an **rtx_export-android-16.aar** file and you need to copy it
    in the app's directory at `rawtx/android/rtx_export-android-16/rtx_export-android-16.aar`.

    * **iOS**, run:
    ```
    dep ensure && xgo -out rtx_export --targets=ios/framework ./
    ```
    This will produce a **rtx_export-ios-5.0-framework/Rtx_export.framework/** folder
    and you need to copy it to `rawtx/ios/rtxnative/Rtx_export.framework`.
1. Once the native libraries are copied, just go to the app's folder, run `npm install` and
run `react-native run-android` or open XCode from the `ios/` folder and launch
the application. As mentioned previously, these will be development builds by
default and will be slower than optimized builds.
1. ...
1. **Enjoy!**

## Contributing
There's still a lot of work that needs to be done, if you know JS/Java or objC and
would like to contribute to the app/UI layer, here's a list of possible features. If
you know golang, you can head over to [lnd](https://github.com/lightningnetwork/lnd) to
contribute at the lightning layer.

Some TODOs/features:
* integrate autopilot,
* support streaming lnd APIs,
* litecoin integration,
* better UI for payments/invoices list screen,
* advanced/simple modes,
* possibility of pointing to remote node,
* satoshi, mbtc, US$ units for balances,
* settings,
* dark theme,
* a specific activity just for handling **lightning:** links.

### In-depth overview of the code
Coming soon.