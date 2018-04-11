/**
 * LND rest client implementation.
 */

/*
 * The standard fetch that's included in react-native doesn't allow adding
 * additional ssl certs, so implement a different version with self signed 
 * ssl support.
 */
import { fetch, encodeBase64 } from './NativeRtxModule.js';

class LndApi {
  constructor(host = 'localhost', port = '8080', pathPrefix = '/v1') {
    this.host = host;
    this.port = port;
    this.pathPrefix = pathPrefix;
    this.TAG = 'LndApi';
  }

  url = path => {
    if (!path.startsWith('/')) {
      path = '/' + path;
    }
    return 'https://' + this.host + ':' + this.port + this.pathPrefix + path;
  };

  log = (...args) => {
    console.log(this.TAG, ...args);
  };

  genericGetJson = async urlIn => {
    try {
      const url = this.url(urlIn);
      const response = await fetch({ url });
      this.log(response);
      const json = JSON.parse(response['bodyString']);
      return json;
    } catch (error) {
      this.log('for url: ' + urlIn + error);
      throw error;
    }
  };

  genericPostJson = async (urlIn, jsonIn) => {
    try {
      const url = this.url(urlIn);
      const response = await fetch({
        url,
        method: 'post',
        jsonBody: JSON.stringify(jsonIn),
      });
      this.log(response);
      const json = JSON.parse(response['bodyString']);
      return json;
    } catch (error) {
      console.error('for url: ' + urlIn + error);
      throw error;
    }
  };

  getInfo = async () => {
    this.log('getting info');
    return await this.genericGetJson('getinfo');
  };

  genSeed = async () => {
    this.log('generating seed');
    return await this.genericGetJson('genseed');
  };

  initwallet = async (cipher, password) => {
    this.log('initializing wallet');
    return await this.genericPostJson('initwallet', {
      wallet_password: await encodeBase64(password),
      cipher_seed_mnemonic: cipher,
    });
  };

  unlockwallet = async password => {
    this.log('unlocking wallet');
    return await this.genericPostJson('unlockwallet', {
      wallet_password: await encodeBase64(password),
    });
  };
}

export default new LndApi();
