/**
 * @flow
 */

import React, { Component } from "react";
import {
  Animated,
  Easing,
  Linking,
  Platform,
  StatusBar,
  StyleSheet,
  UIManager,
  View
} from "react-native";
import { createStackNavigator } from "react-navigation";
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

const transitionConfig = () => {
  return {
    transitionSpec: {
      duration: 750,
      easing: Easing.out(Easing.poly(4)),
      timing: Animated.timing,
      useNativeDriver: true
    },
    screenInterpolator: sceneProps => {
      const { layout, position, scene } = sceneProps;

      const thisSceneIndex = scene.index;
      const width = layout.initWidth;

      const opacity = position.interpolate({
        inputRange: [thisSceneIndex - 1, thisSceneIndex],
        outputRange: [0, 1]
      });

      return { opacity };
    }
  };
};

const RootSwitch = createStackNavigator(
  {
    Intro: { screen: ScreenIntro },
    WalletCreate: { screen: ScreenIntroCreateUnlockWallet },
    GenSeed: { screen: ScreenGenSeed },
    Wallet: { screen: ScreenWallet }
  },
  { headerMode: "none", transitionConfig }
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
                barStyle="dark-content"
              />
            )}
          </ThemeConsumer>

          <LndProvider>
            {this.state.mode == "normal" ? (
              <RootSwitch />
            ) : !!this.state.lightningLink ? (
              <ScreenLightningLink link={this.state.lightningLink} />
            ) : (
              <View />
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
