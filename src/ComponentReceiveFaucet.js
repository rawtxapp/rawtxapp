import React, { Component } from "react";
import {
  ActivityIndicator,
  AsyncStorage,
  Linking,
  StyleSheet,
  View,
  Text,
  TextInput
} from "react-native";

import { styles as theme } from "react-native-theme";
import Button from "react-native-button";
import withLnd from "./withLnd.js";

class ComponentReceiveFaucet extends Component {
  constructor(props) {
    super(props);
    this.state = {
      receiving: false,
      started: true
    };
  }

  componentDidMount() {
    this.getFaucetPubkey();
    this.getAlreadyStarted();
  }

  getAlreadyStarted = async () => {
    const started = await AsyncStorage.getItem(
      "@ComponentReceiveFaucet:started"
    );
    if (started === null) {
      this.setState({ started: false });
    }
  };

  setAlreadyStarted = async () => {
    await AsyncStorage.setItem("@ComponentReceiveFaucet:started", "started");
  };

  _renderPubkey = () => {
    if (!this.state.receiving) return;
    const lastInfo = this.props.walletListener.getLastResponse("GetInfo")
      .identity_pubkey;
    if (!lastInfo) {
      return (
        <View>
          <Text style={theme.errorText}>Couldn't get your pubkey!</Text>
        </View>
      );
    }
    return (
      <View>
        <Text>Your pubkey:</Text>
        <Text selectable style={theme.textInput}>
          {lastInfo}
        </Text>
      </View>
    );
  };

  _renderFaucetPubkey = () => {
    if (!this.state.receiving) return;
    if (this.state.faucetPubkey) {
      return (
        <View>
          <Text>Faucet's address:</Text>
          <Text selectable style={theme.textInput}>
            {this.state.faucetPubkey}
          </Text>
          <Button
            style={[theme.smallButton]}
            onPress={async () => {
              this.setState({ error: "", success: "" });
              try {
                const result = await this.props.lndApi.addPeersAddr(
                  this.state.faucetPubkey
                );
                if (result.error) {
                  this.setState({ error: result.error });
                } else {
                  this.setState({
                    success:
                      "Connected! You can now go to the faucet's webpage. (Channel amount must be at least 250,000 sat, otherwise opening channel might fail)."
                  });
                }
              } catch (err) {
                if (err == "timeout") {
                  this.setState({
                    error:
                      "Received a timeout, it's possible it's connected in the background!"
                  });
                } else {
                  this.setState({ error: JSON.stringify(err.message) });
                }
              }
            }}
          >
            Connect
          </Button>
          <Text style={theme.successText}>{this.state.success}</Text>
          <Text style={theme.errorText}>{this.state.error}</Text>
        </View>
      );
    } else {
      return (
        <View>
          <Text style={theme.warningText}>Couldn't find faucet's pubkey.</Text>
        </View>
      );
    }
  };

  _renderFaucetLink = () => {
    if (!this.state.receiving) return;
    return (
      <View>
        <Button
          style={[theme.smallButton]}
          onPress={async () => {
            await this.setAlreadyStarted();
            Linking.openURL("https://faucet.lightning.community/");
          }}
        >
          https://faucet.lightning.community/
        </Button>
      </View>
    );
  };

  _renderExtraInformation = () => {
    if (!this.state.receiving) return;
    return (
      <View>
        <Text>1. Hold down and copy your pubkey</Text>
        <Text>2. Connect to faucet node</Text>
        <Text>3. Go and fill out the form at faucet's page</Text>
      </View>
    );
  };

  getFaucetPubkey = async () => {
    try {
      const r = await fetch("https://faucet.lightning.community/");
      const b = await r.text();
      const pubkeyExtractor = /[0-9a-f]*@[0-9\.:]*/;
      this.setState({ faucetPubkey: pubkeyExtractor.exec(b)[0] });
    } catch (e) {}
  };

  render() {
    if (this.state.started) {
      return <View />;
    }
    return (
      <View>
        <View style={theme.separator} />
        <Button
          style={[
            theme.inCardButton,
            !this.state.started && theme.successTextColorOnly
          ]}
          onPress={() => {
            this.setState({
              receiving: !this.state.receiving
            });
          }}
        >
          {!this.state.started && "Get started:"} Receive test coins from faucet
        </Button>
        {this._renderExtraInformation()}
        {this._renderPubkey()}
        {this._renderFaucetPubkey()}
        {this._renderFaucetLink()}
      </View>
    );
  }
}

export default withLnd(ComponentReceiveFaucet);

const styles = StyleSheet.create({});
