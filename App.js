/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from "react";
import {
  Button,
  Linking,
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
import ThemeConsumer, { ThemeProvider } from "./ContextTheme";
import ScreenLightningLink from "./ScreenLightningLink.js";

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
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    Linking.getInitialURL()
      .then(url => {
        console.log("Opened with initial link ", url);
        if (url && url.toLowerCase().startsWith("lightning:")) {
          this.setState({ lightningLink: url });
        } else {
          this.setState({ mode: "normal" });
        }
      })
      .catch(() => this.setState({ mode: "normal" }));
  }

  render() {
    return (
      <View style={styles.container}>
        <ThemeProvider>
          <ThemeConsumer>
            {({ statusBar }) => (
              <StatusBar backgroundColor={statusBar} animated={true} />
            )}
          </ThemeConsumer>

          <LndProvider>
            {this.state.mode == "normal" && <RootSwitch />}
            {!!this.state.lightningLink && (
              <ScreenLightningLink link={this.state.lightningLink} />
            )}
          </LndProvider>
        </ThemeProvider>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS == "ios" ? 20 : 0
  }
});
