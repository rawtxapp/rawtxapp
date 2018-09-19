import React, { Component } from "react";
import { StyleSheet, TouchableOpacity, Text, View } from "react-native";
import Button from "react-native-button";
import ComponentSyncing from "./ComponentSyncing";

class ScreenSettings extends Component {
  constructor(props) {
    super(props);
  }

  _renderCloseWallet = () => {
    return (
      <View>
        <TouchableOpacity onPress={this.props.stopWallet}>
          <View style={styles.rowContainer}>
            <Text style={[styles.subsectionText, styles.closeWalletText]}>
              Close wallet
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  _renderSyncing = () => {
    return (
      <View style={styles.rowContainer}>
        <ComponentSyncing />
      </View>
    );
  };

  render() {
    return (
      <View style={styles.container}>
        {this._renderSyncing()}

        <Text style={styles.subsectionHeader}>LOG OUT</Text>
        {this._renderCloseWallet()}
      </View>
    );
  }
}

export default ScreenSettings;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 40
  },
  subsectionHeader: {
    fontWeight: "bold",
    color: "black",
    marginBottom: 5
  },
  subsectionText: {
    color: "black",
    fontSize: 16
  },
  closeWalletText: {
    color: "red"
  },
  rowContainer: {
    justifyContent: "space-between",
    flexDirection: "row",
    paddingVertical: 5
  }
});
