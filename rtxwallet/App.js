/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  Button,
  NativeModules,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { SwitchNavigator } from 'react-navigation';

import ScreenLog from './ScreenLog.js';
import ScreenWallet from './ScreenWallet.js';
import ScreenIntroCreateUnlockWallet from './ScreenIntroCreateUnlockWallet.js';
import ScreenGenSeed from './ScreenGenSeed.js';
import { LogProvider } from './ContextLog.js';
import { LndProvider } from './ContextLnd.js';

const RootSwitch = SwitchNavigator(
  {
    WalletCreate: { screen: ScreenIntroCreateUnlockWallet },
    GenSeed: { screen: ScreenGenSeed },
    Wallet: {screen: ScreenWallet}
  },
  { initialRouteName: 'WalletCreate' },
);

export default class App extends Component<Props> {
  render() {
    return (
      <View style={styles.container}>
        <LndProvider>
          <LogProvider>
            <RootSwitch />
          </LogProvider>
        </LndProvider>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
