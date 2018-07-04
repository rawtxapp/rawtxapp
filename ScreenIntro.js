/* @flow */

import React, { Component } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import withTheme from "./withTheme";
import { Transition } from "react-navigation-fluid-transitions";
import ComponentLogo from "./ComponentLogo";
import { styles as theme } from "react-native-theme";

type Props = {
  logoOnBackgroundColor?: string,
  theme: Object,
  unlockGradient: string[],
  createGradient: string[],
  remoteGradient: string[],
  navigation: Object,
  backgroundGradient: string[]
};
type State = {};
class ScreenIntro extends Component<Props, State> {
  _renderCard = (onPress, icon, action, ix, gradient) => {
    return (
      <View style={[styles.sheetCard, ix && { height: 30 * ix + "%" }]}>
        <Transition shared="sheet">
          <LinearGradient
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            colors={gradient}
            style={theme.absoluteSheetCard}
          />
        </Transition>
        <TouchableOpacity onPress={onPress} style={styles.touchable}>
          <View style={styles.actionContainer}>
            <View style={styles.actionIcon}>
              <Transition shared="icon">
                <Image source={icon} style={styles.icon} />
              </Transition>
            </View>
            <View style={styles.actionText}>
              <Transition shared="action">
                <Text style={styles.sheetCardAction}>{action}</Text>
              </Transition>
            </View>
          </View>
        </TouchableOpacity>
        {ix > 1 && (
          <View style={{ width: "100%", height: 100 - 100 / ix + "%" }} />
        )}
      </View>
    );
  };

  _renderUnlock = () => {
    return this._renderCard(
      () => this.props.navigation.navigate("Unlock"),
      require("./assets/feather/unlock.png"),
      "Unlock",
      1,
      this.props.unlockGradient
    );
  };

  _renderCreate = () => {
    return this._renderCard(
      () => this.props.navigation.navigate("Create"),
      require("./assets/feather/add.png"),
      "Create",
      2,
      this.props.createGradient
    );
  };

  _renderRemote = () => {
    return this._renderCard(
      () => this.props.navigation.navigate("Remote"),
      require("./assets/feather/monitor-1.png"),
      "Remote",
      3,
      this.props.remoteGradient
    );
  };

  render() {
    return (
      <View style={styles.linearGradient}>
        <Transition shared="background">
          <LinearGradient
            start={{ x: 0.0, y: 0 }}
            end={{ x: 1, y: 1.0 }}
            locations={[0, 0.5]}
            colors={this.props.backgroundGradient}
            style={theme.absoluteFill}
          />
        </Transition>
        <View style={styles.container}>
          <ComponentLogo />
          <View style={styles.sheetContainer}>
            {this._renderRemote()}
            {this._renderCreate()}
            {this._renderUnlock()}
          </View>
        </View>
      </View>
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
    flex: 4,
    justifyContent: "flex-end",
    paddingTop: 40
  },
  actionContainer: {
    flexDirection: "row"
  },
  actionIcon: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  sheetCard: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: "20%",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0
  },
  sheetCardAction: {
    fontSize: 36,
    color: "white"
  },
  actionText: {
    flex: 1,
    alignItems: "flex-start"
  },
  touchable: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  icon: {
    width: 30,
    height: 30,
    tintColor: "white"
  }
});
