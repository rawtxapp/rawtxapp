/* @flow */

import React, { Component } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import withTheme from "./withTheme";
import { styles as theme } from "react-native-theme";

type Props = {
  logoOnBackgroundColor?: string,
  theme: Object,
  imageStyles: number,
  useSmallLogo: boolean,
  noSlogan: boolean
};
type State = {};
class ComponentLogo extends Component<Props, State> {
  _renderLogo = () => {
    return (
      <View style={styles.imageContainer}>
        <Image
          source={require("./assets/intro-logo.png")}
          style={[
            styles.logo,
            this.props.imageStyles,
            this.props.useSmallLogo && styles.smallLogo
          ]}
        />
      </View>
    );
  };

  _renderLogoContainer = () => {
    return (
      <View
        style={[
          styles.logoContainer,
          this.props.useSmallLogo && styles.smallLogoContainer
        ]}
      >
        {this._renderLogo()}
        {!this.props.noSlogan && (
          <View style={styles.container}>
            <View>
              <Text style={[this.props.theme.textOnBackground, styles.slogan]}>
                lightning network wallet
              </Text>
            </View>
          </View>
        )}
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
    fontSize: 16,
    color: "rgba(255,255,255,0.7)"
  },
  logoContainer: {
    padding: 50,
    paddingVertical: 20,
    flex: 1
  },
  smallLogoContainer: {
    paddingTop: 0,
    paddingBottom: 20
  },
  imageContainer: {
    alignItems: "center",
    marginBottom: -20
  },
  logo: {
    width: 216,
    height: 80,
    tintColor: "white"
  },
  smallLogo: {
    width: 162,
    height: 60
  }
});
