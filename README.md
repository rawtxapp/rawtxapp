
### Compiling
Please note that when you compile and run from the development
version from the source code, there are a lot of overhead.
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