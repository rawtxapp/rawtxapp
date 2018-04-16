import React, { Component, createContext } from 'react';

const LndContext = createContext({
  startLnd: () => {},
  stopLnd: () => {},
});

import {
  startLnd,
  stopLnd,
  getAppDir,
  fileExists,
  readFile,
  writeFile,
  isLndProcessRunning,
  encodeBase64,
} from './NativeRtxModule.js';
import LndApi from './RestLnd.js';

const WALLET_CONF_FILE = 'wallet.conf';
const DEFAULT_NEUTRINO_CONNECT = 'faucet.lightning.community,rbtcdt.rawtx.com';

const walletConfFilename = async function() {
  const appDir = await getAppDir();
  const walletDir = appDir + '/' + WALLET_CONF_FILE;
  return walletDir;
};

const readWalletConfig = async function() {
  const conf = await readFile(await walletConfFilename());
  const json = JSON.parse(conf && conf != '' ? conf : '{}');
  json.wallets = json.wallets || [];
  for (let i = 0; i < json.wallets.length; i++) {
    const wallet = json.wallets[i];
    const walletExists = await fileExists(wallet.name);
    if (!walletExists) {
      wallet['exists'] = false;
    }
  }
  return json;
};

const writeWalletConfig = async function(contentJSON) {
  return await writeFile(
    await walletConfFilename(),
    JSON.stringify(contentJSON, null, 2),
  );
};

const addWallet = async function(newWallet) {
  newWallet = (({ name, coin, network, mode, neutrinoConnect }) => ({
    name,
    coin,
    network,
    mode,
    neutrinoConnect,
  }))(newWallet);

  // the wallets have folders appDir/wallets/<X>/ structure, the X can't be
  // based on user input because of utf-8 and different input possible,
  // it needs to be generated uniquely, easiest way to do is an int,
  // go through list of all wallets find the max int and increase by 1.
  let walletIx = 0;

  // Validate first
  const currentConfig = await readWalletConfig();
  currentConfig.wallets = currentConfig.wallets || [];
  for (let i = 0; i < currentConfig.wallets.length; i++) {
    const wallet = currentConfig.wallets[i];
    if (newWallet.name == wallet.name) {
      throw new Error('Wallet with this name already exists!');
    }
    if (wallet.ix && wallet.ix > walletIx) {
      walletIx = wallet.ix;
    }
  }

  newWallet.ix = walletIx + 1;

  currentConfig.wallets.push(newWallet);
  await writeWalletConfig(currentConfig);
  return newWallet;
};

const walletDir = async function(wallet) {
  return (await getAppDir()) + '/wallets/' + (wallet.ix || 0) + '/';
};

const writeLndConf = async function(wallet) {
  const walletDirectory = await walletDir(wallet);
  const network = wallet.network || 'testnet';
  const neutrino = wallet.mode == 'neutrino' ? 'bitcoin.node=neutrino' : '';
  const neutrinoConnect = (wallet.neutrinoConnect || DEFAULT_NEUTRINO_CONNECT)
    .split(',')
    .filter(String);
  let peers = '';
  for (let i = 0; i < neutrinoConnect.length; i++) {
    let peer = neutrinoConnect[i];
    peers += (peers.length == 0 ? '' : '\n') + 'neutrino.addpeer=' + peer;
  }
  const conf = `[Application Options]
debuglevel=debug
debughtlc=true
maxpendingchannels=10
no-macaroons=true
maxlogfiles=3
maxlogfilesize=10

[Bitcoin]
bitcoin.active=1
bitcoin.${network}=1
${neutrino}

[Neutrino]
${peers}`;
  console.log('Writing lnd.conf for wallet:');
  console.log(wallet);
  console.log('The lnd.conf');
  console.log(conf);
  return await writeFile(walletDirectory + '/lnd.conf', conf);
};

const startLndFromWallet = async function(wallet) {
  if (!wallet || !wallet.ix) {
    throw new Error("Can't start lnd without a wallet!");
    return;
  }
  await writeLndConf(wallet);
  return await startLnd(await walletDir(wallet));
};

const stopLndFromWallet = async function(wallet) {
  return await stopLnd(await walletDir(wallet));
};

const getRunningWallet = async function() {
  const isRunning = await isLndProcessRunning();
  if (!isRunning) {
    return;
  }

  const filesDir = await getAppDir();
  const lastRunning = await readFile(filesDir + '/lastrunninglnddir.txt');
  if (lastRunning == '') {
    return;
  }
  const walletIx = parseInt(
    lastRunning
      .split('/')
      .filter(String)
      .splice(-1)[0],
  );
  const walletConf = await readWalletConfig();
  for (let i = 0; i < walletConf.wallets.length; i++) {
    const wallet = walletConf.wallets[i];
    if (parseInt(wallet.ix) == walletIx) {
      return wallet;
    }
  }
};

const initWallet = async function(wallet, cipher, password) {};

class LndProvider extends Component {
  constructor(props) {
    super(props);
    this.state = { walletConf: {}, displayUnit: 'satoshi' };
  }

  componentDidMount() {
    readWalletConfig().then(cfg => this.setState({ walletConf: cfg }));
  }

  componentWillUnmount() {}

  // Returns string representation with the unit
  // (ex displaySatoshi(2) = "2 sat")
  displaySatoshi = satoshi => {
    if (!satoshi) return;
    if (this.state.displayUnit == 'satoshi') {
      return satoshi + " sat";
    }
    //TODO: otherwise convert
  };

  render() {
    const walletConf = this.state.walletConf;
    const addWalletUpdateState = async newWallet => {
      newWallet = await addWallet(newWallet);
      const newConf = await readWalletConfig();
      await writeLndConf(newWallet);
      this.setState({ walletConf: newConf });
      return newWallet;
    };
    return (
      <LndContext.Provider
        value={{
          stopLnd,
          getInfo: LndApi.getInfo,
          genSeed: LndApi.genSeed,
          lndApi: LndApi,
          addWallet: addWalletUpdateState,
          wallets: this.state.walletConf.wallets,
          startLndFromWallet,
          isLndProcessRunning,
          getRunningWallet,
          walletDir,
          encodeBase64,
          stopLndFromWallet,
          displaySatoshi: this.displaySatoshi,
        }}
      >
        {this.props.children}
      </LndContext.Provider>
    );
  }
}

export default LndContext.Consumer;
export { LndProvider };
