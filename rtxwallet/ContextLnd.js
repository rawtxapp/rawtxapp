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
} from './NativeRtxModule.js';
import LndApi from './RestLnd.js';

const WALLET_CONF_FILE = 'wallet.conf';

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
  // Validate first
  const currentConfig = await readWalletConfig();
  currentConfig.wallets = currentConfig.wallets || [];
  for (let i = 0; i < currentConfig.wallets.length; i++) {
    const wallet = currentConfig.wallets[i];
    if (newWallet.name == wallet.name) {
      throw new Error('Wallet with this name already exists!');
    }
  }

  const { name, coin, network, mode, neutrinoConnect } = newWallet;

  currentConfig.wallets.push(newWallet);
  return await writeWalletConfig(currentConfig);
};

class LndProvider extends Component {
  constructor(props) {
    super(props);
    this.state = { walletConf: {} };
  }

  componentDidMount() {
    readWalletConfig().then(cfg => this.setState({ walletConf: cfg }));
  }

  componentWillUnmount() {}

  render() {
    const walletConf = this.state.walletConf;
    const addWalletUpdateState = async newWallet => {
      await addWallet(newWallet);
      const newConf = await readWalletConfig();
      this.setState({ walletConf: newConf });
    };
    return (
      <LndContext.Provider
        value={{
          startLnd,
          stopLnd,
          getLndInfo: LndApi.getInfo,
          genSeed: LndApi.genSeed,
          addWallet: addWalletUpdateState,
          wallets: this.state.walletConf.wallets,
        }}
      >
        {this.props.children}
      </LndContext.Provider>
    );
  }
}

export default LndContext.Consumer;
export { LndProvider };
