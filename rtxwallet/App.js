/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from "react";
import {
  Button,
  NativeModules,
  Platform,
  StyleSheet,
  StatusBar,
  Text,
  View,
  UIManager
} from "react-native";

import { SwitchNavigator } from "react-navigation";

import ScreenLog from "./ScreenLog.js";
import ScreenWallet from "./ScreenWallet.js";
import ScreenIntroCreateUnlockWallet from "./ScreenIntroCreateUnlockWallet.js";
import ScreenGenSeed from "./ScreenGenSeed.js";
import { LndProvider } from "./ContextLnd.js";

if (Platform.OS === "android") {
  UIManager.setLayoutAnimationEnabledExperimental &&
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const RootSwitch = SwitchNavigator(
  {
    WalletCreate: { screen: ScreenIntroCreateUnlockWallet },
    GenSeed: { screen: ScreenGenSeed },
    Wallet: { screen: ScreenWallet }
  },
  { initialRouteName: "WalletCreate" }
);

export default class App extends Component<Props> {
  render() {
    return (
      <View style={styles.container}>
        <StatusBar backgroundColor="#0091EA" animated={true} />
        <LndProvider>
          <RootSwitch />
        </LndProvider>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});
