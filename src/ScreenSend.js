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

class ScreenSend extends Component {
  constructor(props) {
    super(props);
    this.state = { payreq: props.payreq };
    if (props.payreq) {
      this._decodePayreq(props.payreq);
    }
  }

  componentWillMount() {
    Clipboard.getString().then(
      str => str && str.length > 0 && this.setState({ pastable: str })
    );
    this.qrListener_ = this.props.qrCodeEvents.once("qrCodeScanned", qr => {
      this.setState({ payreq: qr });
    });
  }

  componentWillUnmount() {
    this.qrListener_.remove();
  }

  componentWillUpdate(nextProps, nextState) {
    if (
      (this.state.payreq &&
        nextState.payreq &&
        nextState.payreq.length > 0 &&
        this.state.payreq != nextState.payreq) ||
      (!this.state.payreq && nextState.payreq && nextState.payreq.length > 0)
    ) {
      const lower = nextState.payreq.toLowerCase();
      if (lower.startsWith("ln") || lower.startsWith("lightning")) {
        this._decodePayreq(nextState.payreq);
      } else {
        this.setState({ address: nextState.payreq });
      }
    }
  }

  _decodePayreq = async payreq => {
    const decoded = await this.props.lndApi.decodepayreq(payreq);
    LayoutAnimation.easeInEaseOut();
    if (!decoded.error) {
      this.setState({ decoded });
    } else {
      this.setState({ decoded: undefined });
    }
  };

  _renderDecoded = () => {
    const { decoded } = this.state;
    if (!decoded) return;
    return (
      <View style={styles.decodedContainer}>
        <View style={styles.decodedRow}>
          <Text style={styles.rowName}>Amount</Text>
          <View style={styles.rowValueContainer}>
            <Text style={[styles.rowValue, styles.amountText]}>
              {this.props.displaySatoshi(decoded.num_satoshis)}
            </Text>
          </View>
        </View>
        <View style={styles.decodedRow}>
          <Text style={styles.rowName}>To</Text>
          <View style={styles.rowValueContainer}>
            <Text style={[styles.rowValue]} selectable>
              {decoded.destination}
            </Text>
          </View>
        </View>
        <View style={styles.decodedRow}>
          <Text style={styles.rowName}>Desc</Text>
          <View style={styles.rowValueContainer}>
            <Text style={[styles.rowValue]}>{decoded.description}</Text>
          </View>
        </View>
      </View>
    );
  };

  _renderPay = () => {
    const { decoded } = this.state;
    if (!decoded) return;
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
                const payment = await this.props.lndApi.sendpaymentPayreq(
                  this.state.payreq
                );
                LayoutAnimation.easeInEaseOut();
                if (payment.error) {
                  this.setState({ error: payment.error });
                } else if (payment.payment_error) {
                  this.setState({ error: payment.payment_error });
                } else if (payment.payment_preimage) {
                  this.setState({ paid: true });
                } else {
                  this.setState({
                    error:
                      "Something happened, got the following result from lnd SendPayment method: " +
                      payment
                  });
                }
              } catch (error) {
                this.setState({ error: error.message });
              }
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
        {!!this.state.error && (
          <Text style={theme.errorText}>{this.state.error}</Text>
        )}
      </View>
    );
  };

  _renderInput = () => {
    const setPayreq = payreq => {
      this.setState({ payreq });
    };
    return (
      <View style={styles.payreqContainer}>
        <TextInput
          style={[
            theme.textInput,
            styles.payreqInput,
            this.state.decoded && theme.textInputSuccess
          ]}
          underlineColorAndroid="transparent"
          placeholder="Payment request or BTC address"
          value={this.state.payreq}
          onChangeText={text => setPayreq(text)}
        />
        {!!this.state.pastable &&
          !this.state.decoded && (
            <Button
              style={theme.actionButton}
              onPress={() => setPayreq(this.state.pastable)}
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
                setPayreq(qr);
              }
            }}
          >
            Scan
          </Button>
        )}
      </View>
    );
  };

  _renderOnchainPay = () => {
    if (
      !this.state.address ||
      !this.state.amount ||
      this.state.address.length == 0 ||
      this.state.amount.length == 0 ||
      this.state.payreq.length == 0
    ) {
      return;
    }
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

  _renderAmountInput = () => {
    if (
      !this.state.address ||
      this.state.address == "" ||
      this.state.payreq == ""
    ) {
      return;
    }
    return (
      <View>
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
        {this._renderAmountInput()}
        {this._renderDecoded()}
        {this._renderPay()}
        {this._renderOnchainPay()}
      </View>
    );
  }
}

export default withLnd(ScreenSend);

const styles = StyleSheet.create({
  payreqContainer: {
    flexDirection: "row",
    alignItems: "center"
  },
  payreqInput: {
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
    flex: 2,
    fontSize: 20,
    textAlign: "right",
    paddingRight: 10
  },
  rowValueContainer: {
    flex: 5,
    justifyContent: "center"
  },
  amountText: {
    fontSize: 20
  },
  payContainer: {
    paddingHorizontal: 40
  }
});
