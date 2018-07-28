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

class ScreenReceiveBlockchain extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentWillMount() {
    this._generateReceiveAddress();
  }

  _generateReceiveAddress = async () => {
    try {
      const newaddress = await this.props.lndApi.newaddress();
      this.setState({
        generatedAddress: newaddress["address"]
      });
    } catch (err) {}
  };

  _renderPaymentRequest = () => {
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

  render() {
    return <View>{this._renderPaymentRequest()}</View>;
  }
}

export default withLnd(ScreenReceiveBlockchain);

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
