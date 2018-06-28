/* @flow */

import React, { Component } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import withTheme from "./withTheme";

type Props = {
  logoOnBackgroundColor?: string,
  theme: Object
};
type State = {};
class ScreenIntro extends Component<Props, State> {
  _renderLogo = () => {
    return (
      <View>
        <Image
          source={require("./assets/intro-logo.png")}
          style={{
            width: undefined,
            height: 80,
            resizeMode: "contain",
            tintColor: this.props.logoOnBackgroundColor
          }}
        />
      </View>
    );
  };

  _renderLogoContainer = () => {
    return (
      <View style={styles.logoContainer}>
        {this._renderLogo()}
        <View style={styles.container}>
          <Text style={[styles.slogan, this.props.theme.textOnBackground]}>
            lightning network wallet
          </Text>
        </View>
      </View>
    );
  };

  render() {
    return <View style={styles.container}>{this._renderLogoContainer()}</View>;
  }
}

export default withTheme(ScreenIntro);

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  slogan: {
    alignSelf: "center",
    fontSize: 16
  },
  logoContainer: {
    padding: 50,
    paddingTop: 20
  }
});
