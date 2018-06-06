package com.rtxwallet;

import android.app.IntentService;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.graphics.Color;
import android.os.Build;
import android.support.annotation.Nullable;
import android.support.annotation.RequiresApi;
import android.support.v4.app.NotificationCompat;
import android.util.Log;

import com.github.lightningnetwork.Rtx_export;

import java.io.File;
import java.io.PrintWriter;

/**
 * Created by user on 3/20/18.
 */

public class LndService extends IntentService {
    private static final String TAG = "LndService";

    private static int FOREGROUND_ID = 4332;

    private String shutdownFile;

    private String notification_channel_id = "lnd_service_notification_channel";

    public LndService() {
        super("LndService");
    }

    @Override
    protected void onHandleIntent(@Nullable Intent intent) {
        Intent mainActivity = new Intent(this, MainActivity.class);
        PendingIntent main = PendingIntent.getActivity(this, 0, mainActivity, 0);
        if(Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            createNotificationChannel();
        }
        Notification notification =
                new NotificationCompat.Builder(this, notification_channel_id)
                        .setContentTitle("LND running in background")
                        .setContentText("Closing the wallet will shut it down.")
                        .setSmallIcon(R.drawable.ic_action_name)
                        .setContentIntent(main)
                        .build();

        startForeground(FOREGROUND_ID, notification);
        String lndDir = intent.getStringExtra("lndDir");
        String initError = initRtx(lndDir);
        if (!initError.isEmpty()) {
            stopSelf();
            return;
        }

        // Write to filesDir the last lnd that was started, will be used to recontruct the wallet
        // in memory in case the app is removed and the service is still running in the background.
        File lastRunning = new File(getApplicationContext().getFilesDir().getPath()+"/lastrunninglnddir.txt");
        try {
            PrintWriter out = new PrintWriter(lastRunning);
            out.println(lndDir);
            out.close();
        }catch (Exception e) {
            e.printStackTrace();
            Log.e(TAG, "Couldn't write lastrunningdir! "+e.getMessage());
            stopSelf();
            return;
        }

        Log.i(TAG, "Starting LND");
        String error = Rtx_export.StartLnd();
        Log.e(TAG, error);
        stopForeground(true);
        writeShutdownFile();
        stopSelf();
    }

    @RequiresApi(Build.VERSION_CODES.O)
    private void createNotificationChannel() {
        NotificationChannel channel = new NotificationChannel(notification_channel_id,
                "LndService",
                NotificationManager.IMPORTANCE_DEFAULT);
        channel.setLightColor(Color.BLUE);
        ((NotificationManager)getSystemService(Context.NOTIFICATION_SERVICE))
                .createNotificationChannel(channel);
    }

    private String initRtx(String lndDir) {
        // Clear shutdown file if it already exists.
        shutdownFile = lndDir + "lndshutdown";
        new File(shutdownFile).delete();

        String err = Rtx_export.InitLnd(lndDir);
        if (!err.isEmpty()) {
            Log.e(TAG, "Initializing LND failed: "+err);
            return err;
        }
        return "";
    }

    private void writeShutdownFile() {
        Log.i(TAG, "Writing shutdown file!");
        try {
            new File(shutdownFile).createNewFile();
        }catch (Exception e){
            e.printStackTrace();
            Log.e(TAG, "Couldn't create shutdown file: "+e.getMessage());
        }
    }

    @Override
    public void onDestroy() {
        Log.i(TAG, "Stopping LND");
        short result = Rtx_export.StopLnd();
        Log.i(TAG, "Result of stopping: "+String.valueOf(result));
        stopForeground(true);
        super.onDestroy();

        writeShutdownFile();
    }
}
