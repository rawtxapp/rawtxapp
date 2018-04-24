import React, { Component } from "react";
import { StyleSheet, Text, View } from "react-native";

import Button from "react-native-button";
import Modal from "react-native-modal";
import withLnd from "./withLnd.js";
import shared from "./SharedStyles.js";
import ScreenQRCodeScan from "./ScreenQRCodeScan.js";
import { BoldText } from "./ComponentShared.js";

class ComponentPayInvoiceButtonInCard extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  decodePayreq = async payreqQR => {
    try {
      console.log("hereb, ", payreqQR);
      const payreq = await this.props.lndApi.decodepayreq(payreqQR);
      console.log("herea, ", payreqQR);
      if (!payreq.error) {
        this.setState({ payreq, payreqQR });
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
    if (!this.state.paying) return;

    return (
      <View>
        <Button
          style={[shared.inCardButton]}
          onPress={() =>
            this.setState({
              scanningQR: true
            })
          }
        >
          By QR code
        </Button>
        {this._renderPayreq(this.state.payreq)}
        {this._renderError(this.state.error)}
      </View>
    );
  };

  _renderModal = () => {
    return (
      <Modal
        isVisible={this.state.scanningQR}
        onBackdropPress={() => this.setState({ scanningQR: false })}
      >
        <ScreenQRCodeScan
          instructions={
            "Point the camera to a payment invoice QR code. Make sure the QR code fills the container above."
          }
          dismiss={() => this.setState({ scanningQR: false })}
          qrScanned={qr => {
            console.log("here: ", qr);
            this.setState({ scanningQR: false, payreq: undefined, error: "" });
            this.decodePayreq(qr);
          }}
        />
      </Modal>
    );
  };

  _renderPaybutton = () => {
    if (!this.state.payreq) return;
    return (
      <View>
        <Button
          style={[shared.inCardButton, shared.greenButton]}
          onPress={async () => {
            try {
              const payment = await this.props.lndApi.sendpaymentPayreq(
                this.state.payreqQR
              );
              console.log(payment);
              this.setState({ payment });
            } catch (error) {
              this.setState({ error });
            }
          }}
        >
          Pay
        </Button>
        <Text>{JSON.stringify(this.state.payment)}</Text>
      </View>
    );
  };

  render() {
    return (
      <View>
        <Button
          style={[shared.inCardButton]}
          onPress={() =>
            this.setState({
              paying: !this.state.paying,
              payreq: undefined
            })
          }
        >
          Pay invoice
        </Button>
        {this._renderPaying()}
        {this._renderPaybutton()}
        {this._renderModal()}
      </View>
    );
  }
}

export default withLnd(ComponentPayInvoiceButtonInCard);
