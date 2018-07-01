/* @flow */

import React, { Component } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import LinearGradient from "react-native-linear-gradient";
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

  _renderUnlock = () => {
    return (
      <LinearGradient
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        colors={this.props.unlockGradient}
        style={styles.sheetCard}
      >
        <View style={styles.actionContainer}>
          <View style={styles.actionText}>
            <Text style={styles.sheetCardAction}>Unlock</Text>
          </View>
          <View style={styles.actionIcon}>
            <Image
              source={require("./assets/feather/unlock.png")}
              style={{ width: 30, height: 30, tintColor: "white" }}
            />
          </View>
        </View>
      </LinearGradient>
    );
  };

  render() {
    return (
      <LinearGradient
        start={{ x: 0.0, y: 0 }}
        end={{ x: 1, y: 1.0 }}
        locations={[0, 0.5]}
        colors={this.props.backgroundGradient}
        style={styles.linearGradient}
      >
        <View style={styles.container}>
          {this._renderLogoContainer()}
          <View style={styles.sheetContainer}>{this._renderUnlock()}</View>
        </View>
      </LinearGradient>
    );
  }
}

export default withTheme(ScreenIntro);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20
  },
  linearGradient: {
    flex: 1
  },
  sheetContainer: {
    flex: 1,
    justifyContent: "flex-end",
    paddingTop: 40
  },
  slogan: {
    alignSelf: "center",
    fontSize: 16
  },
  logoContainer: {
    padding: 50,
    paddingTop: 20
  },
  actionContainer: {
    flexDirection: "row"
  },
  actionIcon: {
    flex: 1,
    alignItems: "center"
  },
  sheetCard: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    flex: 1
  },
  sheetCardAction: {
    fontSize: 36,
    color: "white"
  },
  actionText: {
    flex: 1,
    alignItems: "center"
  }
});
