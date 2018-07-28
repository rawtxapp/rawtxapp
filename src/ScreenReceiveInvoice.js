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

const qrWidth = Dimensions.get("window").width * 0.8;

class ScreenReceiveInvoice extends Component {
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
    console.log(nextState);
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
    if (this.state.payment_request) return;
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
                  LayoutAnimation.easeInEaseOut();
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
              : "Create invoice"}
        </Button>
        {!!this.state.error && (
          <View style={styles.errorContainer}>
            <Text style={theme.errorText}>{this.state.error}</Text>
          </View>
        )}
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
          <Text style={theme.errorText}>Couldn't get your pubkey!</Text>
        </View>
      );
    }
    return (
      <View>
        <View style={styles.row}>
          <View style={styles.rowName}>
            <Text style={styles.rowNameText}>Pubkey</Text>
          </View>
          <View style={styles.rowValue}>
            <Text selectable style={theme.textInput}>
              {lastInfo}
            </Text>
          </View>
        </View>
        <View style={styles.qrCodeContainer}>
          <QRCode value={lastInfo} size={qrWidth} />
        </View>
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

        <ScrollView>
          {this._renderPaymentRequest()}
          {this._renderPubkey()}
        </ScrollView>
      </View>
    );
  }
}

export default withLnd(ScreenReceiveInvoice);

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
  }
});
