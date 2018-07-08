/**
 * @flow
 */

import React, { Component } from "react";
import {
  Linking,
  Platform,
  StatusBar,
  StyleSheet,
  UIManager,
  View
} from "react-native";
import { createSwitchNavigator } from "react-navigation";
import { LndProvider } from "./ContextLnd.js";
import ThemeConsumer, { ThemeProvider } from "./ContextTheme";
import ScreenGenSeed from "./ScreenGenSeed.js";
import ScreenIntro from "./ScreenIntro.js";
import ScreenIntroCreateUnlockWallet from "./ScreenIntroCreateUnlockWallet.js";
import ScreenLightningLink from "./ScreenLightningLink.js";
import ScreenWallet from "./ScreenWallet.js";

if (Platform.OS === "android") {
  UIManager.setLayoutAnimationEnabledExperimental &&
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const RootSwitch = createSwitchNavigator(
  {
    Intro: { screen: ScreenIntro },
    WalletCreate: { screen: ScreenIntroCreateUnlockWallet },
    GenSeed: { screen: ScreenGenSeed },
    Wallet: { screen: ScreenWallet }
  },
  { headerMode: "none" }
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
                barStyle="light-content"
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
