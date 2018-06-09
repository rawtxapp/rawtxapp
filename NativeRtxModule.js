import { DeviceEventEmitter, NativeModules } from "react-native";
import LndApi from "./RestLnd.js";
import { sleep } from "./Utils";

const Rtx = NativeModules.RtxModule;

const startLnd = async function(lndDir) {
  const running = await isLndProcessRunning();
  if (running) {
    console.error("LND is already running, can only run 1 instance of LND!");
    return;
  }
  return await NativeModules.RtxModule.startLnd(lndDir);
};

const stopLnd = async function(lndDir) {
  return await NativeModules.RtxModule.stopLnd(lndDir);
};

const getLastNLines = async function(file, n) {
  return await Rtx.getLastNLines(file, n);
};

const startWatchingLogContent = function(callback) {
  DeviceEventEmitter.addListener("LND_LOGS_MODIFIED", callback);
};

const stopWatchingLogContent = function(callback) {
  DeviceEventEmitter.removeListener("LND_LOGS_MODIFIED", callback);
};

// if request contains:
// method: "post"
// jsonBody: JSONObject
// it will send a POST request to url
const fetch = async function(request) {
  return await Rtx.fetch(request);
};

const readWalletConfig = async function() {
  return await Rtx.readWalletConfig();
};

const readFile = async function(filename) {
  return await Rtx.readFile(filename);
};

const writeFile = async function(filename, content) {
  return await Rtx.writeFile(filename, content);
};

const fileExists = async function(filename) {
  return await Rtx.fileExists(filename);
};

// Directory where we can read and write app specific files, where lnd will
// be created.
const getAppDir = async function() {
  return await Rtx.getFilesDir();
};

const isLndProcessRunning = async function() {
  return await Rtx.isLndProcessRunning();
};

const encodeBase64 = async function(str) {
  return await Rtx.encodeBase64(str);
};

const scanQrCode = async function() {
  let result = await Rtx.scanQrCode();
  // TODO: this is a super ugly hack.
  // animation when coming out of qr code scanning view
  // can create layout bugs (LayoutAnimation on android has
  // issues). for now, just sleep a little bit to give
  // time for the original layout to come back.
  await sleep(500);
  return result;
};

const getMacaroonHex = async function(macaroonFile) {
  return await Rtx.getMacaroonHex(macaroonFile);
};

export {
  startLnd,
  stopLnd,
  startWatchingLogContent,
  stopWatchingLogContent,
  fetch,
  readFile,
  writeFile,
  fileExists,
  getAppDir,
  isLndProcessRunning,
  encodeBase64,
  scanQrCode,
  getMacaroonHex,
  getLastNLines
};
