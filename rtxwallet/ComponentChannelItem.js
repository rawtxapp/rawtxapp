import React, { Component } from "react";
import { StyleSheet, Text, View } from "react-native";
import { styles as theme } from "react-native-theme";

export default class ComponentChannelItem extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { channel } = this.props;
    return (
      <View style={styles.container}>
        <View style={styles.infoContainer}>
          <Text>{channel.chan_id}</Text>
        </View>
        <View style={styles.buttonContainer}>
          <Text>Test</Text>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: 10
  },
  infoContainer: {
    flex: 1
  },
  buttonContainer: {
    flex: 0,
    flexShrink: 1
  }
});
