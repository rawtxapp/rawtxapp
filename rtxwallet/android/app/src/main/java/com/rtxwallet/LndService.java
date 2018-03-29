package com.rtxwallet;

import android.app.IntentService;
import android.app.Notification;
import android.app.PendingIntent;
import android.content.Intent;
import android.support.annotation.Nullable;
import android.util.Log;

import com.github.lightningnetwork.Rtx_export;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.util.Arrays;
import java.util.List;

/**
 * Created by user on 3/20/18.
 */

public class LndService extends IntentService {
    private static final String TAG = "LndService";

    private static int FOREGROUND_ID = 4332;

    public LndService() {
        super("LndService");
    }

    @Override
    protected void onHandleIntent(@Nullable Intent intent) {
        Intent mainActivity = new Intent(this, MainActivity.class);
        PendingIntent main = PendingIntent.getActivity(this, 0, mainActivity, 0);
        Notification notification =
                new Notification.Builder(this)
                        .setContentTitle("LND started")
                        .setContentText("Dismiss this notification to shutdown LND.")
                        .setSmallIcon(R.mipmap.ic_launcher)
                        .setContentIntent(main)
                        .build();

        startForeground(FOREGROUND_ID, notification);
        initRtx();
        Log.i(TAG, "Starting LND");
        String error = Rtx_export.StartLnd();
        Log.i(TAG, error);
        stopForeground(true);
    }

    private void initRtx() {
        String lndDir = getLndDir();
        new File(lndDir).mkdirs();
        String lndConfig = lndDir + "lnd.conf";
        writeLndConfigFile(lndConfig);

        String err = Rtx_export.InitLnd(lndDir);
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
                "debuglevel=info",
                "debughtlc=true",
                "maxpendingchannels=10",
                "no-macaroons=true",
                "",
                "[Bitcoin]",
                "bitcoin.active=1",
                "bitcoin.testnet=1",
                "bitcoin.node=neutrino",
                "",
                "[Neutrino]",
                "neutrino.connect=faucet.lightning.community");
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

    private String getLndDir() {
        String filesDir = getFilesDir().getPath();
        if (filesDir.charAt(filesDir.length()-1) != '/') {
            filesDir = filesDir + '/';
        }
        return filesDir + "lnd/";
    }

    private String getLogFile() {
        return getLndDir()+"logs/bitcoin/testnet/lnd.log";
    }

    @Override
    public void onDestroy() {
        Log.i(TAG, "Stopping LND");
        short result = Rtx_export.StopLnd();
        Log.i(TAG, "Result of stopping: "+String.valueOf(result));
        stopForeground(true);
        super.onDestroy();
    }
}
