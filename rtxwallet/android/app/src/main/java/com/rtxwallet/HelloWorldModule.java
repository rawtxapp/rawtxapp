package com.rtxwallet;


import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class HelloWorldModule extends ReactContextBaseJavaModule {
    static {
        System.loadLibrary("hello_world_jni");
    }
    public HelloWorldModule(ReactApplicationContext reactContext) {
        super(reactContext); //required by React Native
    }

    @Override
    public String getName() {
        return "HelloWorld"; //HelloWorld is how this module will be referred to from React Native
    }

    @ReactMethod
    public void helloWorld(Promise promise) { //this method will be called from JS by React Native
        try {
            String hello = helloWorldJNI();
            promise.resolve(hello);
        } catch (Exception e) {
            promise.reject("ERR", e);
        }
    }


    public native String helloWorldJNI();
}