package com.rtxwallet;


import android.util.Log;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.github.lightningnetwork.Rtx_export;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.util.Arrays;
import java.util.List;

/**
 * Java class for interacting with LND binary that's included.
 *
 * LND's home dir on android will be something like /data/user/0/com.rtxwallet/files/lnd.
 * To configure LND, we'll create a lnd.conf in LND's home dir.
 */
public class RtxModule extends ReactContextBaseJavaModule {
    private static final String TAG = "RtxJava";

    public RtxModule(ReactApplicationContext reactContext) {
        super(reactContext); //required by React Native

        initRtx();
    }

    @Override
    public String getName() {
        return "HelloWorld"; //HelloWorld is how this module will be referred to from React Native
    }

    @ReactMethod
    public void helloWorld() { //this method will be called from JS by React Native
        Log.v(TAG,"path: "+getReactApplicationContext().getFilesDir().getPath());
        Log.v(TAG, "lnd_version: "+Rtx_export.GetLndVersion());
        Rtx_export.TestLogging();
    }

    private void initRtx() {
        String filesDir = getReactApplicationContext().getFilesDir().getPath();
        if (filesDir.charAt(filesDir.length()-1) != '/') {
            filesDir = filesDir + '/';
        }
        String lndDir = filesDir + "lnd/";
        new File(lndDir).mkdirs();
        String lndConfig = lndDir + "lnd.conf";
        writeLndConfigFile(lndConfig);

        String err = Rtx_export.InitLnd(lndDir, "btcd");
        if (!err.isEmpty()) {
            Log.e(TAG, "Initializing LND failed: "+err);
        }
    }

    /**
     * Will create an lnd.conf in LND's home dir. It won't modify it if it already exists.
     */
    private void writeLndConfigFile(String configFile) {
        if (new File(configFile).exists()) {
            Log.i(TAG, "Skipped writing lnd.conf, it already exists");
            return;
        }
        List<String> lines = Arrays.asList(
                "[Application Options]",
                "debuglevel=trace",
                "debughtlc=true",
                "maxpendingchannels=10",
                "",
                "[Bitcoin]",
                "bitcoin.active=1",
                "bitcoin.testnet=1");
        try {
            Log.i(TAG, "Writing lnd.conf");
            BufferedWriter writer = new BufferedWriter(new FileWriter(configFile, true));
            for (String line : lines) {
                writer.append(line);
                writer.append("\n");
            }
            Log.i(TAG, "Finished writing lnd.conf");

            writer.close();
        }catch (IOException e) {
            e.printStackTrace();
            Log.i(TAG, "Couldn't write lnd.conf");
            Log.i(TAG, e.getLocalizedMessage());
        }
    }
}