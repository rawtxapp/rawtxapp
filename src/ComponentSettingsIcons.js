import React, { Component } from "react";
import { Image, StyleSheet, View } from "react-native";
import withTheme from "./withTheme";

class ComponentSettingsIcon extends Component {
  render() {
    return (
      <View>
        <Image
          source={require("../assets/feather/settings.png")}
          style={styles.settingsIcon}
        />
      </View>
    );
  }
}

export default ComponentSettingsIcon;

const styles = StyleSheet.create({
  settingsIcon: {
    width: 32,
    height: 32
  }
});
