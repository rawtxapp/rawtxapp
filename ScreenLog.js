import React, { Component } from "react";

import { ScrollView, StyleSheet, Text, View } from "react-native";
import Button from "react-native-button";

import withLnd from "./withLnd";

class ScreenLog extends Component {
  constructor(props) {
    super(props);

    this.state = {
      textContent: ""
    };
  }

  componentDidMount() {
    this.getLogs();
  }

  getLogs = async () => {
    try {
      const logs = await this.props.getLogs(500);
      if (logs) {
        this.setState({ logs });
      } else {
        this.setState({ error: "Couldn't get logs!" });
      }
    } catch (e) {
      this.setState({ error: e });
    }
  };

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.textContainer}>
          <ScrollView>
            <Text style={styles.text} selectable>
              {this.state.logs}
            </Text>
            <Text style={styles.text}>{this.state.error}</Text>
          </ScrollView>
        </View>
      </View>
    );
  }
}

export default withLnd(ScreenLog);

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  textContainer: {
    flex: 9,
    backgroundColor: "black"
  },
  text: {
    color: "white"
  }
});
