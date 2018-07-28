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

class ScreenSendBlockchain extends Component {
  constructor(props) {
    super(props);
    this.state = { address: "", amount: "" };
  }

  componentWillMount() {
    Clipboard.getString().then(
      str => str && str.length > 0 && this.setState({ pastable: str })
    );
    this.qrListener_ = this.props.qrCodeEvents.once("qrCodeScanned", qr => {
      this.setState({ address: qr, error: "" });
    });
  }

  componentWillUnmount() {
    this.qrListener_.remove();
  }

  _renderPay = () => {
    if (this.state.address.length == "" || this.state.amount.length == "")
      return;
    return (
      <View style={styles.payContainer}>
        <Button
          style={[
            theme.actionButton,
            this.state.paying && theme.activeActionButton,
            !!this.state.error && theme.errorActionButton,
            this.state.paid && theme.successActionButton
          ]}
          onPress={() => {
            if (this.state.paid || this.state.paying || this.state.error) {
              return;
            }
            LayoutAnimation.easeInEaseOut();
            this.setState({ paying: true }, async () => {
              try {
                const payment = await this.props.lndApi.sendTransactionBlockchain(
                  this.state.address,
                  this.state.amount
                );
                LayoutAnimation.easeInEaseOut();
                if (payment.txid) {
                  this.setState({ paymentTx: payment.txid, paid: true });
                } else if (
                  payment.error &&
                  payment.error.includes("already have transaction")
                ) {
                  let paymentTx;
                  if (payment.error.startsWith("Transaction")) {
                    paymentTx = payment.error.split(" ").filter(String)[1];
                  }
                  this.setState({
                    paid: true,
                    paymentTx: paymentTx
                      ? paymentTx
                      : "Your payment should be sent!"
                  });
                } else if (payment.error) {
                  this.setState({ error: payment.error });
                } else {
                  this.setState({ error: "Couldn't send coins!" });
                }
              } catch (e) {
                this.setState({ error: JSON.stringify(e) });
              }
              this.setState({ paying: false });
            });
          }}
        >
          {this.state.error
            ? "Payment failed!"
            : this.state.paid
              ? "Paid!"
              : this.state.paying
                ? "Paying"
                : "Pay"}
        </Button>
        {!!this.state.paymentTx && (
          <Text style={theme.successText}>
            Payment sent, tx id is{" "}
            <Text selectable>{this.state.paymentTx}</Text>.
          </Text>
        )}
        {!!this.state.error && (
          <Text style={theme.errorText}>{this.state.error}</Text>
        )}
      </View>
    );
  };

  _renderInput = () => {
    const setAddress = address => {
      this.setState({ address, error: "" });
    };
    return (
      <View>
        <View style={styles.addressContainer}>
          <TextInput
            style={[theme.textInput, styles.addressInput]}
            underlineColorAndroid="transparent"
            placeholder="Destination address"
            value={this.state.address}
            onChangeText={setAddress}
          />
          {!!this.state.pastable && (
            <Button
              style={theme.actionButton}
              onPress={() => {
                setAddress(this.state.pastable);
              }}
            >
              Paste
            </Button>
          )}
          {!this.state.decoded && (
            <Button
              style={theme.actionButton}
              onPress={async () => {
                const qr = await this.props.scanQrCode();
                if (qr) {
                  setAddress(qr);
                }
              }}
            >
              Scan
            </Button>
          )}
        </View>
        <TextInput
          style={[theme.textInput]}
          underlineColorAndroid="transparent"
          placeholder="Amount (in satoshis)"
          keyboardType="numeric"
          value={this.state.amount}
          onChangeText={text => {
            LayoutAnimation.easeInEaseOut();
            this.setState({ amount: text, error: "" });
          }}
        />
      </View>
    );
  };

  render() {
    return (
      <View>
        {this._renderInput()}
        {this._renderPay()}
      </View>
    );
  }
}

export default withLnd(ScreenSendBlockchain);

const styles = StyleSheet.create({
  addressContainer: {
    flexDirection: "row",
    alignItems: "center"
  },
  addressInput: {
    flex: 1
  },
  decodedContainer: {
    padding: 10
  },
  decodedRow: {
    flexDirection: "row",
    marginBottom: 5
  },
  rowName: {
    flex: 1,
    fontSize: 20,
    textAlign: "right",
    paddingRight: 10
  },
  rowValueContainer: {
    flex: 4,
    justifyContent: "center"
  },
  amountText: {
    fontSize: 20
  },
  payContainer: {
    paddingHorizontal: 40
  }
});
