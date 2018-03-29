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

const getLndCert = function(callback) {
  Rtx.getLndCert(callback);
  LndApi.getInfo();
  //Rtx.testGetInfo();
};

const fetch = async function(request) {
  return await Rtx.fetch(request);
};

export {
  getLogContent,
  startLnd,
  stopLnd,
  startWatchingLogContent,
  stopWatchingLogContent,
  getLndCert,
  fetch,
};
