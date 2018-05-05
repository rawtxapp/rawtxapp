import React, { Component } from "react";
import {
  ActivityIndicator,
  Linking,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";

import Button from "react-native-button";
import withLnd from "./withLnd.js";
import shared from "./SharedStyles.js";
import { BoldText } from "./ComponentShared.js";

class ComponentPayInvoiceButtonInCard extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    this._initState();
    Linking.getInitialURL().then(url => {
      if (
        url &&
        url.startsWith("lightning:") &&
        !this.props.isInitialInvoiceHandled()
      ) {
        this.decodePayreq(url);
        this.props.setInitialInvoiceHandled();
      }
    });
  }

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
        <Text style={shared.errorText}>
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
          style={[shared.inCardButton]}
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
          style={[shared.inCardButton]}
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
          style={shared.textInput}
          underlineColorAndroid="transparent"
          placeholder="Lightning invoice"
          value={this.state.invoice}
          onChangeText={invoice => this.setState({ invoice })}
        />
        <Button
          style={[shared.inCardButton]}
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
          style={[shared.inCardButton, shared.greenButton]}
          styleDisabled={shared.disabledButton}
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
          style={[shared.inCardButton]}
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
              style={[shared.inCardButton, shared.cancelButton]}
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
              style={[shared.inCardButton]}
            >
              Done
            </Button>
          )}
      </View>
    );
  }
}

export default withLnd(ComponentPayInvoiceButtonInCard);
