import React, { Component } from "react";
import {
  ActivityIndicator,
  Clipboard,
  Linking,
  LayoutAnimation,
  Platform,
  StyleSheet,
  Text,
  ToastAndroid,
  TextInput,
  View
} from "react-native";
import Button from "react-native-button";
import withTheme from "./withTheme";
import { styles as theme } from "react-native-theme";
import withLnd from "./withLnd";
import ScreenPayInvoice from "./ScreenPayInvoice";

class ScreenLightningLink extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentWillMount() {
    this._checkRunning();
  }

  _checkRunning = async () => {
    try {
      const running = await this.props.getRunningWallet();
      if (!running) {
        this.setState({ error: "Wallet not running!" });
      } else {
        this.setState({ walletRunning: true });
      }
    } catch (err) {
      this.setState({
        error: "Couldn't check wallet state! " + JSON.stringify(err)
      });
    }
  };

  render() {
    return (
      <View style={styles.container}>
        <Text>{this.state.error}</Text>
        {this.state.walletRunning && (
          <ScreenPayInvoice payreq={this.props.link} />
        )}
      </View>
    );
  }
}

export default withLnd(ScreenLightningLink);

const styles = StyleSheet.create({
  container: {
    padding: 20
  }
});
