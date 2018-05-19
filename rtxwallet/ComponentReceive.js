import React, { Component } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  View,
  Text,
  TextInput
} from "react-native";

import shared from "./SharedStyles.js";
import Button from "react-native-button";
import withLnd from "./withLnd.js";
import QRCode from "react-native-qrcode";

class ComponentReceive extends Component {
  constructor(props) {
    super(props);
    this.state = {
      receiving: false,
      memo: "",
      amt_sat: "",
      error: "",
      working: false
    };
  }

  _renderReceiving = () => {
    if (!this.state.receiving) return;
    const showError = error => {
      this.setState({
        working: false,
        error: "Error: " + JSON.stringify(error)
      });
    };
    return (
      <View>
        <TextInput
          style={[shared.textInput]}
          underlineColorAndroid="transparent"
          placeholder="Description (info payer will see)"
          value={this.state.memo}
          onChangeText={text => this.setState({ memo: text })}
        />
        <TextInput
          style={[shared.textInput]}
          underlineColorAndroid="transparent"
          placeholder="Amount (in satoshis)"
          value={this.state.amt_sat}
          keyboardType="numeric"
          onChangeText={text => this.setState({ amt_sat: text })}
        />
        <Button
          style={[shared.inCardButton]}
          onPress={() => {
            this.setState(
              { working: true, error: "", payment_request: "" },
              async () => {
                try {
                  const res = await this.props.lndApi.addInvoiceSimple(
                    this.state.memo,
                    this.state.amt_sat
                  );
                  if (res.payment_request) {
                    this.setState({
                      payment_request: res.payment_request,
                      working: false
                    });
                  } else if (res.error) {
                    showError(res.error);
                  } else {
                    showError(res);
                  }
                } catch (err) {
                  showError(err);
                }
              }
            );
          }}
        >
          Create invoice
        </Button>
        {this.state.working && <ActivityIndicator />}
        <Text style={shared.errorText}>{this.state.error}</Text>
      </View>
    );
  };

  _renderPubkey = () => {
    if (!this.state.payment_request) return;
    const lastInfo = this.props.walletListener.getLastResponse("GetInfo")
      .identity_pubkey;
    if (!lastInfo) {
      return (
        <View>
          <Text style={shared.errorText}>Couldn't get your pubkey!</Text>
        </View>
      );
    }
    return (
      <View>
        <Text>Your pubkey:</Text>
        <Text selectable style={shared.textInput}>
          {lastInfo}
        </Text>
      </View>
    );
  };

  _renderPaymentRequest = () => {
    if (!this.state.payment_request) return;
    return (
      <View>
        <Text style={shared.headerText}>
          The invoice you need to send to payer
        </Text>
        <Text>Payment request:</Text>
        <Text selectable style={shared.textInput}>
          {this.state.payment_request}
        </Text>
        <View style={styles.qrCodeContainer}>
          <QRCode
            value={"lightning:" + this.state.payment_request}
            size={300}
          />
        </View>
      </View>
    );
  };

  _renderExtraInformation = () => {
    if (!this.state.payment_request) return;
    return (
      <View>
        <Text style={shared.warningText}>
          In order for the payer to find your pubkey, you need to have an IP
          address, on mobile phones, it's difficult to determine an IP address.
        </Text>
        <Text style={shared.warningText}>
          So, you need to either connect to them directly, or connect to a node
          in the lightning network graph and if they connect to the same node,
          they will be able to find your pubkey and open a connection to you in
          order to pay. This is a short term solution, as the network matures
          and the software gets better, you won't have to worry about this.
        </Text>
        <Text style={shared.warningText}>
          You can connect to a node by looking through lightning node under
          "Wallet Operations" below.
        </Text>
      </View>
    );
  };

  render() {
    return (
      <View>
        <Button
          style={[shared.inCardButton]}
          onPress={() => {
            this.setState({
              receiving: !this.state.receiving,
              error: "",
              payment_request: "",
              amt_sat: "",
              memo: ""
            });
          }}
        >
          Receive money
        </Button>
        {this._renderReceiving()}
        {this._renderPaymentRequest()}
        {this._renderPubkey()}
        {this._renderExtraInformation()}
      </View>
    );
  }
}

export default withLnd(ComponentReceive);

const styles = StyleSheet.create({
  qrCodeContainer: {
    alignItems: "center",
    justifyContent: "center"
  }
});
