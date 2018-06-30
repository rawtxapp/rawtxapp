/**
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
import ScreenIntro from "./ScreenIntro.js";

if (Platform.OS === "android") {
  UIManager.setLayoutAnimationEnabledExperimental &&
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const RootSwitch = SwitchNavigator(
  {
    WalletCreate: { screen: ScreenIntroCreateUnlockWallet },
    GenSeed: { screen: ScreenGenSeed },
    Wallet: { screen: ScreenWallet },
    Intro: { screen: ScreenIntro }
  },
  { initialRouteName: "Intro" }
);

type Props = {};
type State = {
  lightningLink?: string,
  mode?: string
};

export default class App extends Component<Props, State> {
  constructor(props: Props) {
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
              <StatusBar
                backgroundColor="rgba(255, 255, 255, 0)"
                translucent={true}
                animated={true}
              />
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
    flex: 1
  }
});
