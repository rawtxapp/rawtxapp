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

class ScreenPayInvoice extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentWillMount() {
    Clipboard.getString().then(
      str => str && str.length > 0 && this.setState({ pastable: str })
    );
    this.qrListener_ = this.props.qrCodeEvents.once("qrCodeScanned", qr => {
      this.setState({ peer: qr, error: "" });
    });
  }

  componentWillUnmount() {
    this.qrListener_.remove();
  }

  _renderConnect = () => {
    if (!this.state.peer) return;
    return (
      <View style={styles.actionContainer}>
        <Button
          style={[
            theme.actionButton,
            this.state.connecting && theme.activeActionButton,
            !!this.state.error && theme.errorActionButton,
            this.state.connected && theme.successActionButton
          ]}
          onPress={() => {
            if (
              this.state.connecting ||
              this.state.error ||
              this.state.connected
            ) {
              return;
            }
            this.setState({ connecting: true }, async () => {
              try {
                if (this.state.peer) {
                  const splitted = this.state.peer.split("@");
                  if (splitted.length < 2) {
                    this.setState({
                      error: "Incorrect peer format!",
                      connecting: false
                    });
                    return;
                  }
                  //Connect to the peer first
                  const res = await this.props.lndApi.addPeers(
                    splitted[0],
                    splitted[1],
                    true
                  );
                  if (!res.error || res.error.includes("already connected")) {
                    this.setState(
                      { connected: true, connecting: false },
                      () => {
                        if (this.props.onConnectedToPeer) {
                          this.props.onConnectedToPeer(this.state.peer);
                        }
                      }
                    );
                    return;
                  }
                }
              } catch (error) {
                this.setState({
                  error: JSON.stringify(error.message)
                });
              }
              this.setState({ connecting: false });
            });
          }}
        >
          {this.state.error
            ? "Connection failed!"
            : this.state.connected
              ? "Connected!"
              : this.state.connecting
                ? "Connecting"
                : "Connect"}
        </Button>
        {!!this.state.error && (
          <Text style={theme.errorText}>{this.state.error}</Text>
        )}
      </View>
    );
  };

  _renderInput = () => {
    const setPeer = peer => {
      LayoutAnimation.easeInEaseOut();
      this.setState({ peer, error: "" });
    };
    return (
      <View style={styles.inputContainer}>
        <TextInput
          style={[theme.textInput, styles.input]}
          underlineColorAndroid="transparent"
          placeholder="pubkey@ip:port"
          value={this.state.peer}
          onChangeText={setPeer}
        />
        {!!this.state.pastable && (
          <Button
            style={theme.actionButton}
            onPress={() => {
              setPeer(this.state.pastable);
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
                setPeer(qr);
              }
            }}
          >
            Scan
          </Button>
        )}
      </View>
    );
  };

  render() {
    return (
      <View>
        {this._renderInput()}
        {this._renderConnect()}
      </View>
    );
  }
}

export default withLnd(ScreenPayInvoice);

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: "row",
    alignItems: "center"
  },
  input: {
    flex: 1
  },
  actionContainer: {
    paddingHorizontal: 40
  }
});
