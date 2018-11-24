/* @flow */

import React, { Component } from "react";
import { Image, StyleSheet, StatusBar, Text, View } from "react-native";
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
          source={require("../assets/intro-logo.png")}
          style={[
            styles.logo,
            this.props.imageStyles,
            this.props.useSmallLogo && styles.smallLogo
          ]}
        />
        {this._renderRightIcon()}
      </View>
    );
  };

  _renderRightIcon = () => {
    if (!this.props.rightIcon) return;
    return (
      <View style={styles.settingsRightIconContainer}>
        {this.props.rightIcon}
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
          <View style={styles.sloganContainer}>
            <Text style={[this.props.theme.textOnBackground, styles.slogan]}>
              lightning network wallet
            </Text>
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
  sloganContainer: {
    paddingTop: 20
  },
  slogan: {
    alignSelf: "center",
    fontSize: 16
  },
  logoContainer: {
    padding: 50,
    paddingVertical: StatusBar.currentHeight || 20,
    flex: 0
  },
  smallLogoContainer: {
    paddingTop: StatusBar.currentHeight || 30,
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
  },
  settingsRightIconContainer: {
    position: "absolute",
    top: 0,
    right: -20,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center"
  }
});
