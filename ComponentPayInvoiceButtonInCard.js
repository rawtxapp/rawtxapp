import React, { Component } from "react";
import {
  ActivityIndicator,
  AppState,
  Linking,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";

import Button from "react-native-button";
import withLnd from "./withLnd.js";
import { styles as theme } from "react-native-theme";
import { BoldText } from "./ComponentShared.js";

class ComponentPayInvoiceButtonInCard extends Component {
  constructor(props) {
    super(props);
    this.state = { appState: AppState.currentState };
  }

  componentDidMount() {
    this._initState();

    this.getInitialUrl();
    AppState.addEventListener("change", this._handleAppStateChange);
  }

  componentWillUnmount() {
    AppState.removeEventListener("change", this._handleAppStateChange);
  }

  getInitialUrl = () => {
    Linking.getInitialURL().then(url => {
      if (url && url.startsWith("lightning:")) {
        this.decodePayreq(url);
        this.props.setInitialInvoiceHandled();
      }
    });
  };

  // sometimes when a link is pressed, android will just launch
  // the existing activity and componentDidMount won't be called.
  // So use AppState listener to also check initialUrl.
  _handleAppStateChange = nextAppState => {
    if (
      this.state.appState.match(/inactive|background/) &&
      nextAppState === "active"
    ) {
      this.getInitialUrl();
    }
    this.setState({ appState: nextAppState });
  };

  _initState = () => {
    this.setState({
      payreq: undefined,
      error: "",
      paymentSuccess: false,
      payingWithInvoice: false,
      invoice: "",
      working: false
    });
  };

  decodePayreq = async payreqQR => {
    try {
      const payreq = await this.props.lndApi.decodepayreq(payreqQR);
      if (!payreq.error) {
        this.setState({ payreq, payreqQR, paying: true });
      } else {
        this.setState({ error: payreq.error });
      }
    } catch (err) {
      this.setState({ error: "Problem decoding payment request: " + err });
    }
  };

  _renderPayreq = payreq => {
    if (!payreq) return;
    const time = new Date();
    time.setTime(payreq.timestamp * 1000);
    return (
      <View>
        <Text>
          {BoldText("Description:")} {payreq.description}
        </Text>
        <Text>
          {BoldText("Num satoshis:")}{" "}
          {this.props.displaySatoshi(payreq.num_satoshis)}
        </Text>
        <Text>
          {BoldText("Timestamp:")} {time.toUTCString()}
        </Text>
      </View>
    );
  };

  _renderError = error => {
    if (!error) return;
    return (
      <View>
        <Text style={theme.errorText}>
          Error: {JSON.stringify(this.state.error)}
        </Text>
      </View>
    );
  };

  _renderPaying = () => {
    if (!this.state.paying || this.state.payreq) return;

    return (
      <View>
        <Button
          style={[theme.inCardButton]}
          onPress={async () => {
            try {
              const qr = await this.props.scanQrCode();
              if (!qr) {
                this.setState({ error: "didn't scan a qr code." });
                return;
              }
              this._initState();
              this.decodePayreq(qr);
            } catch (error) {
              this.setState({ error });
            }
          }}
        >
          By QR code
        </Button>
        <Button
          style={[theme.inCardButton]}
          onPress={() => {
            this._initState();
            this.setState({ payingWithInvoice: !this.state.payingWithInvoice });
          }}
        >
          By lightning invoice
        </Button>
        {this._renderPayingWithInvoice()}
      </View>
    );
  };

  _renderPayingWithInvoice = () => {
    if (!this.state.payingWithInvoice) return;
    return (
      <View>
        <TextInput
          style={theme.textInput}
          underlineColorAndroid="transparent"
          placeholder="Lightning invoice"
          value={this.state.invoice}
          onChangeText={invoice => this.setState({ invoice })}
        />
        <Button
          style={[theme.inCardButton]}
          onPress={() => {
            this.setState({ error: "", payreq: undefined });
            this.decodePayreq(this.state.invoice);
          }}
        >
          Decode payreq
        </Button>
      </View>
    );
  };

  _renderPaybutton = () => {
    if (!this.state.payreq) return;
    const notWorking = () => this.setState({ working: false });
    return (
      <View>
        <Button
          style={[theme.inCardButton, theme.greenButton]}
          styleDisabled={theme.disabledButton}
          disabled={this.state.working}
          onPress={async () => {
            if (this.state.working) return;
            this.setState({ working: true }, async () => {
              try {
                const payment = await this.props.lndApi.sendpaymentPayreq(
                  this.state.payreqQR
                );
                if (payment.error) {
                  this.setState({ error: payment.error });
                } else if (payment.payment_error) {
                  this.setState({ error: payment.payment_error });
                } else if (payment.payment_preimage) {
                  this.setState({ payment, paymentSuccess: true });
                } else {
                  this.setState({
                    error:
                      "Something happened, got the following result from lnd SendPayment method: " +
                      payment
                  });
                }
                notWorking();
              } catch (error) {
                this.setState({ error: error.message });
                notWorking();
              }
            });
          }}
        >
          Pay
        </Button>
        {this.state.working && <ActivityIndicator />}
        <Text>{this.state.paymentSuccess ? "Successfully paid!" : ""}</Text>
      </View>
    );
  };

  render() {
    return (
      <View>
        <Button
          style={[theme.inCardButton]}
          onPress={() => {
            this._initState();
            this.setState({
              paying: !this.state.paying
            });
          }}
        >
          Pay invoice
        </Button>
        {this._renderPaying()}
        {this._renderPayreq(this.state.payreq)}
        {this._renderError(this.state.error)}
        {this._renderPaybutton()}
        {this.state.paying &&
          !this.state.paymentSuccess && (
            <Button
              onPress={() => {
                this._initState();
                this.setState({ paying: false });
              }}
              style={[theme.inCardButton, theme.cancelButton]}
            >
              Cancel payment
            </Button>
          )}
        {this.state.paying &&
          this.state.paymentSuccess && (
            <Button
              onPress={() => {
                this._initState();
                this.setState({ paying: false });
              }}
              style={[theme.inCardButton]}
            >
              Done
            </Button>
          )}
      </View>
    );
  }
}

export default withLnd(ComponentPayInvoiceButtonInCard);
