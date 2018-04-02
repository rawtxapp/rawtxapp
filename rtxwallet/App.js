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

import ScreenLog from './ScreenLog.js';
import ScreenIntroCreateUnlockWallet from './ScreenIntroCreateUnlockWallet.js';
import { LogProvider } from './ContextLog.js';
import { LndProvider } from './ContextLnd.js';

type Props = {};
export default class App extends Component<Props> {
  render() {
    return (
      <View style={styles.container}>
        <LndProvider>
          <LogProvider>
            <ScreenIntroCreateUnlockWallet />
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
