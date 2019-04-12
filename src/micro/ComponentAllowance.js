import React, { Component } from "react";
import { Text, StyleSheet, View, WebView } from "react-native";
import withMicro from "./withMicro";
import Button from "react-native-button";
import { styles as theme } from "react-native-theme";
import withLnd from "../withLnd";

class ComponentAllowance extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  _withMicro() {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerBig}>App's current allowance</Text>
          <Text style={styles.headerSmall}>
            {this.props.displaySatoshi(this.props.currentAllowance)}
          </Text>
        </View>
        <View>
          <Text>
            By giving an allowance to a lightning app, you are allowing it to
            charge up to that amount in the background without interrupting your
            usage.
          </Text>
          <Text>
            An app can ask for a maximum of 10k satoshis allowance, you can
            cancel it whenever you want.
          </Text>
        </View>
        <View style={theme.separator} />
        <View>
          <Button
            style={theme.actionButton}
            onPress={() => this.props.micro.setCurrentAllowance(1e4)}
          >
            Allow up to 10k satoshis
          </Button>
          <Button
            style={theme.errorActionButtonFull}
            onPress={() => this.props.micro.setCurrentAllowance(0)}
          >
            Cancel allowance
          </Button>
        </View>
      </View>
    );
  }

  _withoutMicro() {
    return (
      <View style={styles.container}>
        <Text>Lapp doesn't support project micro.</Text>
      </View>
    );
  }

  render() {
    if (this.props.lapp.microEnabled) return this._withMicro();
    else return this._withoutMicro();
  }
}

export default withLnd(withMicro(ComponentAllowance));

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10
  },
  headerBig: {
    fontSize: 20,
    marginRight: 10
  },
  headerSmall: {
    fontSize: 18
  }
});
