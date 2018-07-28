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
import ComponentConnectPeer from "./ComponentConnectPeer";

class ScreenPayInvoice extends Component {
  constructor(props) {
    super(props);
    this.state = { connectedToPeer: null };
  }

  componentWillMount() {
    Clipboard.getString().then(
      str => str && str.length > 0 && this.setState({ pastable: str })
    );
  }

  _renderPay = () => {
    if (!this.state.amount) return;
    return (
      <View style={styles.payContainer}>
        <Button
          style={[
            theme.actionButton,
            this.state.creating && theme.activeActionButton,
            !!this.state.error && theme.errorActionButton,
            this.state.created && theme.successActionButton
          ]}
          onPress={() => {
            if (this.state.created || this.state.creating || this.state.error) {
              return;
            }
            LayoutAnimation.easeInEaseOut();
            this.setState({ creating: true }, async () => {
              try {
                const peerPubkey = this.state.connectedToPeer.split("@")[0];
                const res = await this.props.lndApi.openChannel({
                  node_pubkey_string: peerPubkey,
                  local_funding_amount: this.state.amount
                });
                if (res.error) {
                  this.setState({ error: JSON.stringify(res.error) });
                } else {
                  this.setState({
                    error: "",
                    created: true
                  });
                }
              } catch (error) {
                this.setState({ error: JSON.stringify(error.message) });
              }
              this.setState({ creating: false });
            });
          }}
        >
          {this.state.error
            ? "Failed!"
            : this.state.created
              ? "Created!"
              : this.state.creating
                ? "Creating"
                : "Create channel"}
        </Button>
        {!!this.state.error && (
          <Text style={theme.errorText}>{this.state.error}</Text>
        )}
      </View>
    );
  };

  _renderInput = () => {
    if (!this.state.connectedToPeer) return;
    return (
      <View>
        <Text style={[theme.successText, styles.success]}>Connected!</Text>
        <Text style={[theme.successText, styles.success]}>
          Please enter at least 250000 satoshis to make sure the channel opens.
        </Text>
        <TextInput
          style={[theme.textInput]}
          underlineColorAndroid="transparent"
          placeholder="Local amount (in satoshis)"
          value={this.state.amount}
          keyboardType="numeric"
          onChangeText={text => {
            LayoutAnimation.easeInEaseOut();
            this.setState({ amount: text, error: "" });
          }}
        />
      </View>
    );
  };

  _renderPeerConnect = () => {
    if (this.state.connectedToPeer) return;
    return (
      <ComponentConnectPeer
        onConnectedToPeer={peer => {
          this.setState({ connectedToPeer: peer });
        }}
      />
    );
  };

  render() {
    return (
      <View>
        {this._renderPeerConnect()}
        {this._renderInput()}
        {this._renderPay()}
      </View>
    );
  }
}

export default withLnd(ScreenPayInvoice);

const styles = StyleSheet.create({
  rowValueContainer: {
    flex: 4,
    justifyContent: "center"
  },
  amountText: {
    fontSize: 20
  },
  payContainer: {
    paddingHorizontal: 40
  },
  success: {
    paddingHorizontal: 10,
    paddingTop: 10
  }
});
