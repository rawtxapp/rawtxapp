import { DeviceEventEmitter, NativeModules } from 'react-native';
import LndApi from './RestLnd.js';

const Rtx = NativeModules.RtxModule;

const startLnd = function() {
  NativeModules.RtxModule.startLnd();
};

const stopLnd = function() {
  NativeModules.RtxModule.stopLnd();
};

const getLogContent = function(callback) {
  Rtx.getLogContent(callback);
};

const startWatchingLogContent = function(callback) {
  DeviceEventEmitter.addListener('LND_LOGS_MODIFIED', callback);
};

const stopWatchingLogContent = function(callback) {
  DeviceEventEmitter.removeListener('LND_LOGS_MODIFIED', callback);
};

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

export {
  getLogContent,
  startLnd,
  stopLnd,
  startWatchingLogContent,
  stopWatchingLogContent,
  fetch,
  readFile,
  writeFile,
  fileExists,
  getAppDir
};
