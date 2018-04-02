package com.rtxwallet;


import android.app.ActivityManager;
import android.content.Context;
import android.content.Intent;
import android.os.AsyncTask;
import android.os.FileObserver;
import android.os.Process;
import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import java.io.BufferedInputStream;
import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.URL;
import java.security.KeyStore;
import java.security.cert.Certificate;
import java.security.cert.CertificateFactory;
import java.security.cert.X509Certificate;
import java.util.ArrayDeque;
import java.util.Arrays;
import java.util.Iterator;
import java.util.List;

import javax.annotation.Nullable;
import javax.net.ssl.HttpsURLConnection;
import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManagerFactory;
import javax.net.ssl.X509TrustManager;

import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;

/**
 * Java class for interacting with LND binary that's included.
 * <p>
 * LND's home dir on android will be something like /data/user/0/com.rtxwallet/files/lnd.
 * To configure LND, we'll create a lnd.conf in LND's home dir.
 */
public class RtxModule extends ReactContextBaseJavaModule implements LifecycleEventListener {
    private static final String TAG = "RtxJava";
    private static final int MAX_LINES_LOG_WINDOW = 200;

    private final LogWatcher logWatcher;

    private SSLContext sslContext;
    private OkHttpClient httpClient;

    public RtxModule(ReactApplicationContext reactContext) {
        super(reactContext); //required by React Native
        reactContext.addLifecycleEventListener(this);
//        initRtx();
        logWatcher = new LogWatcher(getLogFile());

        createTrustCertContextAndHttpClient();
    }

    @Override
    public String getName() {
        return "RtxModule";
    }

    private void initRtx() {
//        String lndDir = getLndDir();
//        new File(lndDir).mkdirs();
//        String lndConfig = lndDir + "lnd.conf";
//        writeLndConfigFile(lndConfig);
//
//        String err = Rtx_export.InitLnd(lndDir);
//        if (!err.isEmpty()) {
//            Log.e(TAG, "Initializing LND failed: " + err);
//        }
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
        } catch (IOException e) {
            e.printStackTrace();
            Log.i(TAG, "Couldn't write lnd.conf");
            Log.i(TAG, e.getLocalizedMessage());
        }
    }

    @ReactMethod
    public void startLnd() {
        Log.i(TAG, "Starting LND service.");
        Intent intent = new Intent(getCurrentActivity().getApplicationContext(), LndService.class);
        getCurrentActivity().startService(intent);
    }

    @ReactMethod
    public void stopLnd() {
        Log.i(TAG, "Stopping LND service.");
        Intent intent = new Intent(getCurrentActivity().getApplicationContext(), LndService.class);
        getCurrentActivity().stopService(intent);
//        try {
//            Thread.sleep(10000);
//        } catch (Exception e) {
//
//        }
        ActivityManager am = (ActivityManager) getCurrentActivity()
                .getApplicationContext().getSystemService(Context.ACTIVITY_SERVICE);
        for (ActivityManager.RunningAppProcessInfo p : am.getRunningAppProcesses()) {
            if (p.processName.equals("com.rtxwallet:rtxLndProcess")) {
                Log.i(TAG, "Killing pid: " + String.valueOf(p.pid));
                Process.killProcess(p.pid);
            }
        }
    }

    private String readFile(String fileName) {
        // This will reference one line at a time
        String line;
        StringBuilder stringBuilder = new StringBuilder();

        try {
            // FileReader reads text files in the default encoding.
            FileReader fileReader =
                    new FileReader(fileName);

            // Always wrap FileReader in BufferedReader.
            BufferedReader bufferedReader =
                    new BufferedReader(fileReader);

            while ((line = bufferedReader.readLine()) != null) {
                stringBuilder.append(line);
            }

            // Always close files.
            bufferedReader.close();
        } catch (FileNotFoundException ex) {
            Log.e(TAG, "Unable to open file '" + fileName + "'");
            return "";
        } catch (IOException ex) {
            Log.e(TAG, "Error reading file '" + fileName + "'");
            return "";
        }
        return stringBuilder.toString();
    }

    private void createTrustCertContextAndHttpClient() {
        try {
            sslContext = SSLContext.getDefault();
            httpClient = new OkHttpClient.Builder().build();

            // Load CAs from an InputStream
            // (could be from a resource or ByteArrayInputStream or ...)
            CertificateFactory cf = CertificateFactory.getInstance("X.509");
            // From https://www.washington.edu/itconnect/security/ca/load-der.crt
            InputStream caInput = new BufferedInputStream(new FileInputStream(getLndDir() + "tls.cert"));
            Certificate ca;
            try {
                ca = cf.generateCertificate(caInput);
                System.out.println("ca=" + ((X509Certificate) ca).getSubjectDN());
            } finally {
                caInput.close();
            }

            // Create a KeyStore containing our trusted CAs
            String keyStoreType = KeyStore.getDefaultType();
            KeyStore keyStore = KeyStore.getInstance(keyStoreType);
            keyStore.load(null, null);
            keyStore.setCertificateEntry("ca", ca);

            // Create a TrustManager that trusts the CAs in our KeyStore
            String tmfAlgorithm = TrustManagerFactory.getDefaultAlgorithm();
            TrustManagerFactory tmf = TrustManagerFactory.getInstance(tmfAlgorithm);
            tmf.init(keyStore);
            Log.i(TAG, "trust manager length " + String.valueOf(tmf.getTrustManagers().length));

            if (tmf.getTrustManagers().length != 1 || !(tmf.getTrustManagers()[0] instanceof X509TrustManager)) {
                Log.e(TAG, "Unexpected default trust managers, there should be just 1 of type X509.");
            }
            X509TrustManager trustManager = (X509TrustManager) tmf.getTrustManagers()[0];
            // Create an SSLContext that uses our TrustManager
            SSLContext context = SSLContext.getInstance("TLS");
            context.init(null, tmf.getTrustManagers(), null);
            sslContext = context;
            httpClient = new OkHttpClient.Builder().sslSocketFactory(context.getSocketFactory(), trustManager).build();

            HttpsURLConnection.setDefaultSSLSocketFactory(context.getSocketFactory());
        } catch (Exception e) {
            e.printStackTrace();
            Log.e(TAG, e.getMessage());
        }
    }

    @ReactMethod
    public void fetch(ReadableMap jsRequest, Promise promise) {
        if (httpClient == null || sslContext == null) {
            Log.e(TAG, "Can't fetch, httpclient or sslcontext not set!");
            return;
        }
        if (!jsRequest.hasKey("url")) {
            Log.e(TAG, "Fetch request doesn't have a url!");
        }
        Request request = new Request.Builder()
                .url(jsRequest.getString("url"))
                .build();
        try {
            Response response = httpClient.newCall(request).execute();
            
            WritableMap jsResponse = Arguments.createMap();
            jsResponse.putString("bodyString", response.body().string());
            promise.resolve(jsResponse);
        } catch (Exception e) {
            e.printStackTrace();
            Log.e(TAG, "Couldn't run fetch!");
            Log.e(TAG, e.getMessage());
            promise.reject(e);
        }
    }

    @ReactMethod
    public void readFile(String filename, Promise promise) {
        promise.resolve(readFile(filename));
    }

    @ReactMethod
    public void writeFile(String filename, String content, Promise promise) {
        try {
            new File(filename).mkdirs();
            PrintWriter out = new PrintWriter(filename);
            out.println(content);
            out.close();
            promise.resolve("success");
        }catch (Exception e){
            Log.e(TAG, "Couldn't write "+filename);
            promise.reject(e);
        }
    }

    @ReactMethod
    public void getFilesDir(Promise promise) {
        promise.resolve(getReactApplicationContext().getFilesDir().getPath());
    }

    @ReactMethod
    public void fileExists(String filename, Promise promise) {
        File f = new File(filename);
        promise.resolve(f.exists() && !f.isDirectory());
    }

    /*
    TODO: use this method to build a way of debugging rest api connection problems.
    For example, if the rest calls in JS fail over and over, call this method from JS and
    show to the user the stack trace.
     */
    @ReactMethod
    public void testGetInfo() {
//        trustCert();
        try {
            URL url = new URL("https://localhost:8080/v1/getinfo");
            HttpsURLConnection con = (HttpsURLConnection) url.openConnection();
            con.setRequestMethod("GET");


            int status = con.getResponseCode();
            Log.i(TAG, String.valueOf(status));
            BufferedReader in = new BufferedReader(new InputStreamReader(con.getInputStream()));
            String inputLine;
            StringBuilder content = new StringBuilder();
            while ((inputLine = in.readLine()) != null) {
                content.append(inputLine);
            }
            in.close();
            Log.i(TAG, content.toString());

        } catch (Exception e) {
            e.printStackTrace();
            Log.e(TAG, e.getMessage());
        }

    }

    @ReactMethod
    public void getLogContent(Callback callback) {
        // The name of the file to open.
        String fileName = getLogFile();

        // This will reference one line at a time
        String line;
        ArrayDeque<String> movingWindowLog = new ArrayDeque<>(MAX_LINES_LOG_WINDOW);

        try {
            // FileReader reads text files in the default encoding.
            FileReader fileReader =
                    new FileReader(fileName);

            // Always wrap FileReader in BufferedReader.
            BufferedReader bufferedReader =
                    new BufferedReader(fileReader);

            while ((line = bufferedReader.readLine()) != null) {
                movingWindowLog.addLast(line);
                if (movingWindowLog.size() > MAX_LINES_LOG_WINDOW) {
                    movingWindowLog.removeFirst();
                }
            }

            // Always close files.
            bufferedReader.close();
        } catch (FileNotFoundException ex) {
            Log.e(TAG, "Unable to open file '" + fileName + "'");
            callback.invoke("");
            return;
        } catch (IOException ex) {
            Log.e(TAG, "Error reading file '" + fileName + "'");
            callback.invoke("");
            return;
        }

        StringBuilder stringBuilder = new StringBuilder();
        Iterator<String> reverseIterator = movingWindowLog.descendingIterator();
        while (reverseIterator.hasNext()) {
            String next = reverseIterator.next();
            stringBuilder.append(next + '\n');
        }
        callback.invoke(stringBuilder.toString());
    }

    private String getLndDir() {
        String filesDir = getReactApplicationContext().getFilesDir().getPath();
        if (filesDir.charAt(filesDir.length() - 1) != '/') {
            filesDir = filesDir + '/';
        }
        return filesDir + "lnd/";
    }

    private String getLogFile() {
        return getLndDir() + "logs/bitcoin/testnet/lnd.log";
    }

    @Override
    public void onHostResume() {
        Log.i(TAG, "onHostResume");
        logWatcher.startWatching();
    }

    @Override
    public void onHostPause() {
        Log.i(TAG, "onHostPause");
        logWatcher.stopWatching();
    }

    @Override
    public void onHostDestroy() {
        Log.i(TAG, "onHostDestroy");
    }

    class LogWatcher extends FileObserver {
        LogWatcher(String file) {
            super(file);
        }

        @Override
        public void onEvent(int i, @Nullable String s) {
            if (i != FileObserver.MODIFY) return;
            getReactApplicationContext().getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit("LND_LOGS_MODIFIED", s);
        }
    }

    class LndStopper extends AsyncTask<Void, Void, Void> {
        @Override
        protected Void doInBackground(Void... voids) {
            Intent intent = new Intent(getCurrentActivity().getApplicationContext(), LndService.class);
            getCurrentActivity().stopService(intent);
//            try {
//                Thread.sleep(10000);
//            }catch (Exception e) {
//
//            }

            ActivityManager am = (ActivityManager) getCurrentActivity()
                    .getApplicationContext().getSystemService(Context.ACTIVITY_SERVICE);
            for (ActivityManager.RunningAppProcessInfo p : am.getRunningAppProcesses()) {
                Log.i(TAG, "running before " + p.processName);
            }
            Log.i(TAG, "Killing rtxLndBackgroundProcess");

            for (ActivityManager.RunningAppProcessInfo p : am.getRunningAppProcesses()) {
                if (p.processName.equals("com.rtxwallet:rtxLndProcess")) {
                    Log.i(TAG, "Killing pid: " + String.valueOf(p.pid));
                    Process.killProcess(p.pid);
                }
            }
            for (ActivityManager.RunningAppProcessInfo p : am.getRunningAppProcesses()) {
                Log.i(TAG, "running after " + p.processName);
            }

            return null;
        }
    }
}