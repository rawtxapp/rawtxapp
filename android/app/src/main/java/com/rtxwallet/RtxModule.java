package com.rtxwallet;


import android.app.Activity;
import android.app.ActivityManager;
import android.content.Context;
import android.content.Intent;
import android.os.AsyncTask;
import android.os.Build;
import android.os.FileObserver;
import android.os.Process;
import android.util.Base64;
import android.util.Log;

import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.BaseActivityEventListener;
import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableMapKeySetIterator;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.google.zxing.integration.android.IntentIntegrator;
import com.google.zxing.integration.android.IntentResult;

import java.io.BufferedInputStream;
import java.io.BufferedReader;
import java.io.DataOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.io.RandomAccessFile;
import java.net.URL;
import java.security.KeyStore;
import java.security.cert.Certificate;
import java.security.cert.CertificateFactory;
import java.security.cert.X509Certificate;
import java.util.ArrayDeque;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

import javax.annotation.Nullable;
import javax.net.ssl.HttpsURLConnection;
import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManagerFactory;
import javax.net.ssl.X509TrustManager;

import okhttp3.Interceptor;
import okhttp3.OkHttpClient;
import okhttp3.Response;
import okhttp3.logging.HttpLoggingInterceptor;

/**
 * Java class for interacting with LND binary that's included.
 * <p>
 * LND's home dir on android will be something like /data/user/0/com.rtxwallet/files/lnd.
 * To configure LND, we'll create a lnd.conf in LND's home dir.
 */
public class RtxModule extends ReactContextBaseJavaModule implements LifecycleEventListener {
    private static final String TAG = "RtxJava";

//    private LogWatcher logWatcher;

    private SSLContext sslContext;
    private X509TrustManager trustManager;

    private Promise qrScanPromise;

    private final ActivityEventListener mActivityEventListener = new BaseActivityEventListener() {

        @Override
        public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent intent) {
            IntentResult scanResult = IntentIntegrator.parseActivityResult(requestCode, resultCode, intent);
            if(scanResult != null){
                qrScanPromise.resolve(scanResult.getContents());
            }else {
                qrScanPromise.reject(new Exception("Couldn't read qr code."));
            }
            qrScanPromise = null;
        }
    };


    public RtxModule(ReactApplicationContext reactContext) {
        super(reactContext); //required by React Native
        reactContext.addLifecycleEventListener(this);
//        logWatcher = new LogWatcher(getLogFile());

        reactContext.addActivityEventListener(mActivityEventListener);
    }

    @Override
    public String getName() {
        return "RtxModule";
    }

    @ReactMethod
    public void startLnd(String lndDir, final Promise promise) {
        AsyncTask<String, Void, Void> task = new AsyncTask<String, Void, Void>() {
            @Override
            protected Void doInBackground(String... strings) {
                String lndDir = strings[0];
                Log.i(TAG, "Starting LND service.");
                Intent intent = new Intent(getCurrentActivity().getApplicationContext(), LndService.class);
                intent.putExtra("lndDir", lndDir);
                if(Build.VERSION.SDK_INT >= Build.VERSION_CODES.O){
                    getCurrentActivity().startForegroundService(intent);
                }else {
                    getCurrentActivity().startService(intent);
                }

                // Wait until tls.cert file exists.
                Log.i(TAG, "Waiting for tls.cert file to exists!");
                // TODO: add check to make sure we don't wait >20seconds for service to start.
                while(!new File(lndDir+"tls.cert").exists()) {
                    try {
                        Thread.sleep(200);
                    }catch (Exception e){
                        e.printStackTrace();
                        promise.reject(e);
                    }
                }
                Log.i(TAG, "Found tls.cert!");

                try{
                    // This is a hack to wait until RPC servers are up, better way is to
                    // modify the LND binary to return channels when it's done setting up RPC endpoints.
                    Thread.sleep(1500);
                    createTrustCertContext();
                }catch (Exception e){
                    e.printStackTrace();
                    Log.e(TAG, e.getMessage());
                }
                Log.i(TAG, "Resolving startLnd promise!");
                promise.resolve("success");

                return null;
            }
        }.execute(lndDir);
    }

    // -1 return means no process with the name found.
    private int getLndProcessPid () {
        ActivityManager am = (ActivityManager) getCurrentActivity()
                .getApplicationContext().getSystemService(Context.ACTIVITY_SERVICE);
        for (ActivityManager.RunningAppProcessInfo p : am.getRunningAppProcesses()) {
            if (p.processName.equals("com.rtxwallet:rtxLndProcess")) {
                Log.i(TAG, "rtxLndProcess pid: " + String.valueOf(p.pid));
                return p.pid;
            }
        }
        return -1;
    }

    @ReactMethod
    public void stopLnd(String lndDir, final Promise promise) {
        Log.i(TAG, "Stopping LND service("+lndDir+").");
        AsyncTask<String, Void, Void> task = new AsyncTask<String, Void, Void>() {
            @Override
            protected Void doInBackground(String... strings) {
                String lndDir = strings[0];

                Log.i(TAG, "Stopping LND service background.");
                Intent intent = new Intent(getCurrentActivity().getApplicationContext(), LndService.class);
                getCurrentActivity().stopService(intent);

                long currentMillis = System.currentTimeMillis();
                boolean foundShutdown = true;
                Log.i(TAG, "Waiting for shutdown file to exists!");
                while(!new File(lndDir+"lndshutdown").exists()) {
                    if (System.currentTimeMillis() - currentMillis > 10000) {
                        // It usually should be killed within a few seconds.
                        Log.i(TAG,"Couldn't find shutdown file within 10 seconds, killing process!");
                        foundShutdown = false;
                        break;
                    }
                    try {
                        Thread.sleep(200);
                    }catch (Exception e){
                        e.printStackTrace();
                        promise.reject(e);
                    }
                }
                if(foundShutdown){
                    Log.i(TAG, "Found shutdown file!");
                }

                Process.killProcess(getLndProcessPid());
                promise.resolve("success");

                return null;
            }
        }.execute(lndDir);
    }

    @ReactMethod
    public void scanQrCode(Promise promise) {
        qrScanPromise = promise;
        IntentIntegrator integrator = new IntentIntegrator(getCurrentActivity());
        integrator.initiateScan();
    }

    @ReactMethod
    public void isLndProcessRunning(Promise promise) {
        promise.resolve(getLndProcessPid() != -1);
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

    private String walletsDir(){
        return getReactApplicationContext().getFilesDir().getPath()+"/wallets";
    }

    private void createTrustCertContextAndHttpClient() throws Exception{
        Log.i(TAG, "Updating trust certs and http client!");
        sslContext = SSLContext.getDefault();
//        httpClient = new OkHttpClient.Builder().build();

        // Load CAs from an InputStream
        // Map over all wallets and trust all their certificates.
        CertificateFactory cf = CertificateFactory.getInstance("X.509");
        File walletsDir = new File(walletsDir());
        Map<String, Certificate> certificates = new HashMap<>();
        for(File walletDir : walletsDir.listFiles()) {
            if(walletDir.isDirectory()) {
                File certFile = new File(walletDir.getPath()+"/tls.cert");
                if(certFile.exists()) {
                    Log.i(TAG, "Adding tls cert for wallet "+walletDir.getName());
                    InputStream caInput = new BufferedInputStream(new FileInputStream(certFile));
                    Certificate ca;
                    try {
                        ca = cf.generateCertificate(caInput);
                        System.out.println("ca=" + ((X509Certificate) ca).getSubjectDN());
                        certificates.put("wallet"+walletDir.getName(), ca);
                    } finally {
                        caInput.close();
                    }
                }
            }
        }

        // Create a KeyStore containing our trusted CAs
        String keyStoreType = KeyStore.getDefaultType();
        KeyStore keyStore = KeyStore.getInstance(keyStoreType);
        keyStore.load(null, null);
        for(Map.Entry<String, Certificate> entry : certificates.entrySet()) {
            keyStore.setCertificateEntry(entry.getKey(), entry.getValue());
        }

        // Create a TrustManager that trusts the CAs in our KeyStore
        String tmfAlgorithm = TrustManagerFactory.getDefaultAlgorithm();
        TrustManagerFactory tmf = TrustManagerFactory.getInstance(tmfAlgorithm);
        tmf.init(keyStore);

        if (tmf.getTrustManagers().length != 1 || !(tmf.getTrustManagers()[0] instanceof X509TrustManager)) {
            Log.e(TAG, "Unexpected default trust managers, there should be just 1 of type X509.");
        }
        X509TrustManager trustManager = (X509TrustManager) tmf.getTrustManagers()[0];
        // Create an SSLContext that uses our TrustManager
        SSLContext context = SSLContext.getInstance("TLS");
        context.init(null, tmf.getTrustManagers(), null);
        sslContext = context;
        // TODO: disable logging in prod
        HttpLoggingInterceptor l = new HttpLoggingInterceptor(new HttpLoggingInterceptor.Logger(){
            @Override public void log(String message) {
                Log.i(TAG, message);
            }
        });
        l.setLevel(HttpLoggingInterceptor.Level.BODY);
        OkHttpClient.Builder builder = new OkHttpClient.Builder()
                .sslSocketFactory(context.getSocketFactory(), trustManager)
                .addInterceptor(new RemoveCachingInterceptor())
//                .addInterceptor(l)
                .cache(null);
//        httpClient = builder.build();

//        HttpsURLConnection.setDefaultSSLSocketFactory(context.getSocketFactory());
    }

    private void createTrustCertContext() throws Exception{
        Log.i(TAG, "Updating trust certs and http client!");

        // Load CAs from an InputStream
        // Map over all wallets and trust all their certificates.
        CertificateFactory cf = CertificateFactory.getInstance("X.509");
        File walletsDir = new File(walletsDir());
        Map<String, Certificate> certificates = new HashMap<>();
        for(File walletDir : walletsDir.listFiles()) {
            if(walletDir.isDirectory()) {
                File certFile = new File(walletDir.getPath()+"/tls.cert");
                if(certFile.exists()) {
                    Log.i(TAG, "Adding tls cert for wallet "+walletDir.getName());
                    InputStream caInput = new BufferedInputStream(new FileInputStream(certFile));
                    Certificate ca;
                    try {
                        ca = cf.generateCertificate(caInput);
                        System.out.println("ca=" + ((X509Certificate) ca).getSubjectDN());
                        certificates.put("wallet"+walletDir.getName(), ca);
                    } finally {
                        caInput.close();
                    }
                }
            }
        }

        // Create a KeyStore containing our trusted CAs
        String keyStoreType = KeyStore.getDefaultType();
        KeyStore keyStore = KeyStore.getInstance(keyStoreType);
        keyStore.load(null, null);
        for(Map.Entry<String, Certificate> entry : certificates.entrySet()) {
            keyStore.setCertificateEntry(entry.getKey(), entry.getValue());
        }

        // Create a TrustManager that trusts the CAs in our KeyStore
        String tmfAlgorithm = TrustManagerFactory.getDefaultAlgorithm();
        TrustManagerFactory tmf = TrustManagerFactory.getInstance(tmfAlgorithm);
        tmf.init(keyStore);

        if (tmf.getTrustManagers().length != 1 || !(tmf.getTrustManagers()[0] instanceof X509TrustManager)) {
            Log.e(TAG, "Unexpected default trust managers, there should be just 1 of type X509.");
        }
        trustManager = (X509TrustManager) tmf.getTrustManagers()[0];
        // Create an SSLContext that uses our TrustManager
        SSLContext context = SSLContext.getInstance("TLS");
        context.init(null, tmf.getTrustManagers(), null);
        sslContext = context;
    }

    private OkHttpClient createHttpClient(SSLContext context, X509TrustManager trustManager) {
        // TODO: disable logging in prod
        HttpLoggingInterceptor l = new HttpLoggingInterceptor(new HttpLoggingInterceptor.Logger(){
            @Override public void log(String message) {
                Log.i(TAG, message);
            }
        });
        l.setLevel(HttpLoggingInterceptor.Level.BODY);
        OkHttpClient.Builder builder = new OkHttpClient.Builder()
                .sslSocketFactory(context.getSocketFactory(), trustManager)
                .addInterceptor(new RemoveCachingInterceptor())
//                .addInterceptor(l)
                .cache(null);
        return builder.build();
    }


    @ReactMethod
    public void fetch(ReadableMap jsRequest, Promise promise) {
        AsyncTask<Void, Void, Void> task = new AsyncTask<Void, Void, Void>() {
            @Override
            protected Void doInBackground(Void... params) {
                if (sslContext == null) {
                    Log.i(TAG, "fetch: httpclient or sslcontext not set!");

                    try {
                        createTrustCertContext();
                    }catch (Exception e){
                        e.printStackTrace();
                        Log.e(TAG, e.getMessage());
                        promise.reject(new Throwable("Couldn't set httpclient or sslcontext!"));
                        return null;
                    }
                }
                if (!jsRequest.hasKey("url")) {
                    Log.e(TAG, "Fetch request doesn't have a url!");
                }

                HttpsURLConnection connection = null;
                try {
                    URL url = new URL(jsRequest.getString("url"));
                    connection = (HttpsURLConnection) url.openConnection();
                    connection.setSSLSocketFactory(sslContext.getSocketFactory());
                    connection.setUseCaches(false);
                    connection.setConnectTimeout(3000);
                    connection.setReadTimeout(10000);
                    if (jsRequest.hasKey("headers")) {
                        ReadableMap jsHeaders = jsRequest.getMap("headers");
                        ReadableMapKeySetIterator iterator = jsHeaders.keySetIterator();
                        while(iterator.hasNextKey()) {
                            String key = iterator.nextKey();
                            String value = jsHeaders.getString(key);
                            connection.setRequestProperty(key, value);
                        }
                    }
                    if(jsRequest.hasKey("method") &&
                            jsRequest.getString("method").toLowerCase().equals("post")) {
                        if (jsRequest.hasKey("jsonBody")) {
                            String body = jsRequest.getString("jsonBody");
                            connection.setRequestMethod("POST");
                            connection.setRequestProperty("Content-Type",
                                    "application/x-www-form-urlencoded");
                            connection.setRequestProperty("Content-Length",
                                    Integer.toString(body.getBytes().length));

                            connection.setDoOutput(true);

                            //Send request
                            DataOutputStream wr = new DataOutputStream(
                                    connection.getOutputStream());
                            wr.writeBytes(body);
                            wr.close();
                        }
                    }else if(jsRequest.hasKey("method") && jsRequest.getString("method").toLowerCase().equals("delete")){
                        connection.setRequestMethod("DELETE");
                        connection.setRequestProperty("Content-Type",
                                "application/x-www-form-urlencoded");
                        connection.setDoOutput(true);
                    } else {
                        connection.setRequestMethod("GET");
                    }

                    int status = connection.getResponseCode();
                    InputStream is;
                    if (status == 200) {
                        //Get Response
                        is = connection.getInputStream();
                    } else {
                        is = connection.getErrorStream();
                    }
                    BufferedReader rd = new BufferedReader(new InputStreamReader(is));
                    StringBuilder response = new StringBuilder(); // or StringBuffer if Java version 5+
                    String line;
                    while ((line = rd.readLine()) != null) {
                        if(response.length() != 0){
                            response.append("\r");
                        }
                        response.append(line);
                    }
                    rd.close();

                    WritableMap jsResponse = Arguments.createMap();
                    jsResponse.putString("bodyString", response.toString());
                    promise.resolve(jsResponse);
                }catch (Exception e){
                    e.printStackTrace();
                    Log.e(TAG, e.toString());
                    promise.reject(e);
                }finally {
                    if (connection != null ){
                        connection.disconnect();
                    }
                }
                return null;
            }
        }.execute();

    }

    private static byte[] readFileByte(File file) throws IOException {
        // Open file
        RandomAccessFile f = new RandomAccessFile(file, "r");
        try {
            // Get and check length
            long longlength = f.length();
            int length = (int) longlength;
            if (length != longlength)
                throw new IOException("File size >= 2 GB");
            // Read file and return data
            byte[] data = new byte[length];
            f.readFully(data);
            return data;
        } finally {
            f.close();
        }
    }

    private final static char[] hexArray = "0123456789ABCDEF".toCharArray();
    private static String bytesToHex(byte[] bytes) {
        char[] hexChars = new char[bytes.length * 2];
        for ( int j = 0; j < bytes.length; j++ ) {
            int v = bytes[j] & 0xFF;
            hexChars[j * 2] = hexArray[v >>> 4];
            hexChars[j * 2 + 1] = hexArray[v & 0x0F];
        }
        return new String(hexChars);
    }

    @ReactMethod
    public void getMacaroonHex(String macaroonFile, Promise promise) {
        try {
            promise.resolve(bytesToHex(readFileByte(new File(macaroonFile))));
        }catch (Exception e){
            e.printStackTrace();
            promise.reject(e);
        }
    }

    // Some POST methods on GRPC rest are "bytes" fields and they are converted from base64 strings.
    // For example InitWallet's password field.
    // https://github.com/grpc-ecosystem/grpc-gateway/blob/463c5eda4ce58dd590b94bd2ac931db6790a1d2c/runtime/convert.go
    @ReactMethod
    public void encodeBase64(String toConvert, Promise promise){
        promise.resolve(Base64.encodeToString(toConvert.getBytes(), Base64.NO_WRAP));
    }

    @ReactMethod
    public void readFile(String filename, Promise promise) {
        promise.resolve(readFile(filename));
    }

    @ReactMethod
    public void writeFile(String filename, String content, Promise promise) {
        try {
            new File(filename).getParentFile().mkdirs();
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

    // Returns last N lines of a file. Very ineffient, do better.
    @ReactMethod
    public void getLastNLines(String file, int maxLine, Promise promise) {
        // This will reference one line at a time
        String line;
        ArrayDeque<String> movingWindowLog = new ArrayDeque<>(maxLine+1);
        try {
            // FileReader reads text files in the default encoding.
            FileReader fileReader =
                    new FileReader(file);

            // Always wrap FileReader in BufferedReader.
            BufferedReader bufferedReader =
                    new BufferedReader(fileReader);

            while ((line = bufferedReader.readLine()) != null) {
                // TODO: super ugly hack to remove [INF] RPCS lines from logs because they are
                // not very useful. Find a much better approach!!!
                if (line.contains("[INF] RPCS")) {
                    continue;
                }
                movingWindowLog.addLast(line);
                if (movingWindowLog.size() > maxLine) {
                    movingWindowLog.removeFirst();
                }
            }

            bufferedReader.close();
        } catch (FileNotFoundException ex) {
            Log.e(TAG, "Unable to open file '" + file + "'");
            promise.reject(ex);
            return;
        } catch (IOException ex) {
            Log.e(TAG, "Error reading file '" + file + "'");
            promise.reject(ex);
            return;
        }

        StringBuilder stringBuilder = new StringBuilder();
        Iterator<String> reverseIterator = movingWindowLog.descendingIterator();
        while (reverseIterator.hasNext()) {
            String next = reverseIterator.next();
            stringBuilder.append(next + '\n');
        }
        promise.resolve(stringBuilder.toString());
    }

    @Override
    public void onHostResume() {
        Log.i(TAG, "onHostResume");
//        logWatcher.startWatching();
    }

    @Override
    public void onHostPause() {
        Log.i(TAG, "onHostPause");
//        logWatcher.stopWatching();
    }

    final class RemoveCachingInterceptor implements Interceptor {
        @Override public Response intercept(Chain chain) throws IOException {
            Response response = chain.proceed(chain.request());
            if (response.code() == 404) {
                response = response.newBuilder()
                        .removeHeader("Cache-Control")
                        .addHeader("Cache-Control", "no-store").build();
            }
            return response;
        }
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