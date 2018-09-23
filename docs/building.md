## Building from source
**Please note:** when you compile and run from the development
version from the source code by default, there is a lot of overhead.
The profile server will be open on port :6060, lnd log levels
will be set to info and app logs will be set at the info level.
This will lead to performance problems and overheating of your phone,
if you don't want to develop but still compile from source code,
look into documentation on how to build a release build of
react-native project.

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

ps:

If you run into libfishhook.a related errors on XCode, patch:
https://github.com/facebook/react-native/pull/19579
into node_modules/react-native/ code.

If you run into config.h not found:
https://github.com/facebook/react-native/issues/14382