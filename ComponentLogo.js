/* @flow */

import React, { Component } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import withTheme from "./withTheme";
import { styles as theme } from "react-native-theme";

import { Transition } from "react-navigation-fluid-transitions";

type Props = {
  logoOnBackgroundColor?: string,
  theme: Object
};
type State = {};
class ComponentLogo extends Component<Props, State> {
  _renderLogo = () => {
    return (
      <View style={styles.imageContainer}>
        <Transition shared="logo">
          <Image
            source={require("./assets/intro-logo.png")}
            style={{
              width: 216,
              height: 80,
              tintColor: "white"
            }}
          />
        </Transition>
      </View>
    );
  };

  _renderLogoContainer = () => {
    return (
      <View style={styles.logoContainer}>
        {this._renderLogo()}
        <View style={styles.container}>
          <Transition shared="slogan">
            <View>
              <Text style={[styles.slogan, this.props.theme.textOnBackground]}>
                lightning network wallet
              </Text>
            </View>
          </Transition>
        </View>
      </View>
    );
  };

  render() {
    return this._renderLogoContainer();
  }
}

export default withTheme(ComponentLogo);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20
  },
  slogan: {
    alignSelf: "center",
    fontSize: 16
  },
  logoContainer: {
    padding: 50,
    paddingTop: 20,
    flex: 1
  },
  imageContainer: {
    alignItems: "center",
    marginBottom: -20
  }
});
