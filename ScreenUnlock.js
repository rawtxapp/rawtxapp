/* @flow */

import React, { Component } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import withTheme from "./withTheme";
import { styles as theme } from "react-native-theme";

import { Transition } from "react-navigation-fluid-transitions";
import ComponentLogo from "./ComponentLogo";

type Props = {
  logoOnBackgroundColor?: string,
  theme: Object
};
type State = {};
class ScreenIntro extends Component<Props, State> {
  _renderUnlock = () => {
    return (
      <LinearGradient
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        colors={this.props.unlockGradient}
        style={styles.sheetCard}
      >
        <View style={styles.actionContainer}>
          <View style={styles.actionIcon}>
            <Transition shared="icon">
              <Image
                source={require("./assets/feather/unlock.png")}
                style={{ width: 30, height: 30, tintColor: "white" }}
              />
            </Transition>
          </View>
          <View style={styles.actionText}>
            <Transition shared="action">
              <Text style={styles.sheetCardAction}>Unlock</Text>
            </Transition>
          </View>
        </View>
      </LinearGradient>
    );
  };

  render() {
    return (
      <View style={styles.linearGradient}>
        <LinearGradient
          start={{ x: 0.0, y: 0 }}
          end={{ x: 1, y: 1.0 }}
          locations={[0, 0.5]}
          colors={this.props.unlockBackgroundGradient}
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            right: 0
          }}
        />
        <View style={styles.container}>
          <ComponentLogo />
          <View style={styles.sheetContainer}>{this._renderUnlock()}</View>
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
    flex: 1,
    justifyContent: "flex-end",
    paddingTop: 40
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
