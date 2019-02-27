import React, { Component } from "react";
import {
  ActivityIndicator,
  Clipboard,
  Linking,
  Dimensions,
  LayoutAnimation,
  Platform,
  ScrollView,
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
import QRCode from "react-native-qrcode";
import { convertErrorToStr } from "./Utils";

const qrWidth = Dimensions.get("window").width * 0.8;

class ScreenReceive extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentWillMount() {
    Clipboard.getString().then(
      str => str && str.length > 0 && this.setState({ pastable: str })
    );
  }

  componentWillUpdate(nextProps, nextState) {
    if (
      (this.state.payreq &&
        nextState.payreq &&
        nextState.payreq.length > 0 &&
        this.state.payreq != nextState.payreq) ||
      (!this.state.payreq && nextState.payreq && nextState.payreq.length > 0)
    ) {
      this._decodePayreq(nextState.payreq);
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

  _renderInput = () => {
    if (this.state.payment_request || this.state.generatedAddress) return;
    const showError = error => {
      this.setState({
        working: false,
        error: "Error: " + JSON.stringify(error)
      });
    };
    return (
      <View>
        <TextInput
          style={[theme.textInput]}
          underlineColorAndroid="transparent"
          placeholder="Description (info payer will see)"
          value={this.state.memo}
          onChangeText={text => this.setState({ memo: text })}
        />
        <TextInput
          style={[theme.textInput]}
          underlineColorAndroid="transparent"
          placeholder="Amount (in satoshis)"
          value={this.state.amt_sat}
          keyboardType="numeric"
          onChangeText={text => this.setState({ amt_sat: text })}
        />
        <Button
          style={[
            theme.actionButton,
            this.state.working && theme.activeActionButton,
            !!this.state.error && theme.errorActionButton
          ]}
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
                      payment_request: res.payment_request
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
          {this.state.error
            ? "Creating invoice failed!"
            : this.state.working
            ? "Creating"
            : "Create lightning invoice"}
        </Button>
        {!!this.state.error && (
          <View style={styles.errorContainer}>
            <Text style={theme.errorText}>{this.state.error}</Text>
          </View>
        )}
      </View>
    );
  };

  _renderOnchainAddress = () => {
    if (!this.state.generatedAddress) return;
    return (
      <View>
        <Text selectable style={theme.textInput}>
          {this.state.generatedAddress}
        </Text>
        <View style={styles.qrCodeContainer}>
          <QRCode value={this.state.generatedAddress} size={qrWidth} />
        </View>
      </View>
    );
  };

  _renderGenerateOnchain = () => {
    if (this.state.payment_request || this.state.generatedAddress) return;
    return (
      <View>
        <View style={styles.orContainer}>
          <Text style={styles.orText}>- or -</Text>
        </View>

        <Button
          style={[
            theme.actionButton,
            this.state.onchainWorking && theme.activeActionButton,
            !!this.state.onchainError && theme.errorActionButton
          ]}
          onPress={() => {
            this.setState(
              {
                onchainWorking: true,
                error: "",
                onchainError: "",
                payment_request: "",
                generatedAddress: ""
              },
              async () => {
                try {
                  const newaddress = await this.props.lndApi.newaddress();
                  this.setState({
                    generatedAddress: newaddress["address"]
                  });
                } catch (err) {
                  this.setState({ onchainError: convertErrorToStr(err) });
                }
                this.setState({ onchainWorking: false });
              }
            );
          }}
        >
          {this.state.onchainWorking
            ? "Generating"
            : "Generate blockchain address"}
        </Button>
        {!!this.state.onchainError && (
          <View style={styles.errorContainer}>
            <Text style={theme.errorText}>{this.state.onchainError}</Text>
          </View>
        )}
      </View>
    );
  };

  _renderInfo = () => {
    if (!this.state.payment_request) return;
    return (
      <View style={styles.rowName}>
        <Text style={styles.noteText}>
          Note: all your channels are private, the invoice includes routing
          hints which the other peer will use to pay you.
        </Text>
        <Text style={styles.noteText}>
          You don't need to share your pubkey or IP address because routing
          hints are enough and you don't want anyone to open a channel to you
          since a mobile wallet isn't ideal for routing payments.
        </Text>
      </View>
    );
  };

  _renderPaymentRequest = () => {
    if (!this.state.payment_request) return;
    return (
      <View>
        <View style={styles.row}>
          <View style={styles.rowName}>
            <Text style={styles.rowNameText}>Invoice</Text>
          </View>
          <View style={styles.rowValue}>
            <Text selectable style={theme.textInput}>
              {this.state.payment_request}
            </Text>
          </View>
        </View>
        <View style={styles.qrCodeContainer}>
          <QRCode
            value={"lightning:" + this.state.payment_request.toUpperCase()}
            size={qrWidth}
          />
        </View>
      </View>
    );
  };

  render() {
    return (
      <View>
        {this._renderInput()}
        {this._renderGenerateOnchain()}

        <ScrollView>
          {this._renderOnchainAddress()}
          {this._renderPaymentRequest()}
          {this._renderInfo()}
        </ScrollView>
      </View>
    );
  }
}

export default withLnd(ScreenReceive);

const styles = StyleSheet.create({
  errorContainer: {
    paddingHorizontal: 10,
    paddingVertical: 5
  },
  row: {
    flexDirection: "row"
  },
  rowName: {
    flex: 0,
    justifyContent: "center",
    paddingHorizontal: 10,
    flexShrink: 1
  },
  rowNameText: {
    fontSize: 20
  },
  rowValue: {
    flex: 3
  },
  qrCodeContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 10
  },
  orContainer: {
    alignItems: "center"
  },
  orText: {
    fontSize: 20
  },
  noteText: {
    fontSize: 12
  }
});
