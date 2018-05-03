import React, { Component } from "react";
import { Modal, StyleSheet, View, Text, TextInput } from "react-native";

import shared from "./SharedStyles.js";
import Button from "react-native-button";
import withLnd from "./withLnd.js";
import ScreenSelectPeer from "./ScreenSelectPeer.js";

class ComponentTransferToChecking extends Component {
  constructor(props) {
    super(props);
    this.state = {
      transferring: false,
      selectingPeer: false,
      selectedPeer: undefined,
      amount: "",
      error: undefined,
      success: undefined
    };
  }

  resetState = () => {
    this.setState({
      selectingPeer: false,
      selectedPeer: undefined,
      amount: "",
      error: undefined,
      success: undefined,
      scannedPeerCode: "",
      working: false
    });
  };

  _renderSelectedPeer = () => {
    if (!this.state.selectedPeer && !this.state.scannedPeerCode) return;
    let peerPubkey;
    if (this.state.selectedPeer) {
      peerPubkey = this.state.selectedPeer.pub_key;
    } else {
      peerPubkey = this.state.scannedPeerCode;
    }
    return (
      <View>
        <Text selectable>
          Selected peer:{" "}
          {this.state.selectedPeer && this.state.selectedPeer.pub_key}
          {this.state.scannedPeerCode && this.state.scannedPeerCode}
        </Text>

        <View style={shared.flexRow}>
          <TextInput
            style={[shared.textInput, shared.flexThree]}
            underlineColorAndroid="transparent"
            placeholder="Amount"
            value={this.state.amount}
            onChangeText={text => this.setState({ amount: text })}
          />
          <View style={[shared.flexOne, shared.centerPrimaryAxis]}>
            <Text>{this.props.getDisplayUnit()}</Text>
          </View>
        </View>
        <Button
          style={shared.inCardButton}
          onPress={async () => {
            try {
              if (this.state.scannedPeerCode) {
                const splitted = this.state.scannedPeerCode.split("@");
                //Connect to the peer first
                await this.props.lndApi.addPeers(
                  splitted[0],
                  splitted[1],
                  true
                );
              }
              const res = await this.props.lndApi.openChannel({
                node_pubkey_string: peerPubkey,
                local_funding_amount: this.props.displayUnitToSatoshi(
                  this.state.amount
                )
              });
              if (res.error) {
                this.setState({ error: JSON.stringify(res.error) });
                return;
              } else {
                this.setState({ success: "Successfully created channel!" });
              }
            } catch (error) {
              this.setState({ error: JSON.stringify(error.message) });
            }
          }}
        >
          Create channel
        </Button>
        <Text style={shared.warningText}>
          All the following issues will go away once the software and the
          network are more mature, but for now you should know the following:
        </Text>
        <Text style={shared.warningText}>
          Your savings account balance could go to 0 while creating the channel,
          it's expected, the balance will be accurate after the channel is open.
        </Text>
        <Text style={shared.warningText}>
          Opening a channel could fail for many reasons (peer is down, etc), if
          opening channel with 1 peer fails, try another one. You can connect to
          more peers by opening the network graph nodes in "Wallet operations".
        </Text>
        <Text style={shared.warningText}>
          It's recommended that you have more than a single channel (preferably
          5) in your checking account so that your payments get routed to the
          destination without problem.
        </Text>
        <Text style={shared.warningText}>
          If opening a channel fails with timeout, it's possible that it's still
          being created in the background, but we didn't get a response in time.
          Just wait a little bit, if you see pending open channel increased in
          "Checking account", it's working!
        </Text>
      </View>
    );
  };

  _renderSuccessOrError = () => {
    if (this.state.error) {
      return (
        <View>
          <Text style={shared.errorText}>{this.state.error}</Text>
        </View>
      );
    } else if (this.state.success) {
      return (
        <View>
          <Text>{this.state.success}</Text>
        </View>
      );
    }
  };

  _renderTransferring = () => {
    if (!this.state.transferring) return;
    return (
      <View>
        <Button
          onPress={() => this.setState({ selectingPeer: true })}
          style={shared.inCardButton}
        >
          Open channel to an existing peer
        </Button>
        <Button
          onPress={async () => {
            try {
              const qr = await this.props.scanQrCode();
              if (!qr) {
                this.setState({ error: "didn't scan a qr code." });
                return;
              }
              this.setState({
                payreq: undefined,
                error: "",
                scannedPeerCode: qr
              });
            } catch (error) {
              this.setState({ error });
            }
          }}
          style={shared.inCardButton}
        >
          Create new channel to a peer by QR code
        </Button>
        {this._renderSelectedPeer()}
        {this._renderSuccessOrError()}
        <Button
          onPress={() => {
            this.setState({
              transferring: false
            });
            this.resetState();
          }}
          style={[
            shared.inCardButton,
            !this.state.success && shared.cancelButton
          ]}
        >
          {this.state.success ? "Done" : "Cancel transfer"}
        </Button>
      </View>
    );
  };

  _renderModalSelectPeer = () => {
    return (
      <Modal
        visible={this.state.selectingPeer}
        onRequestClose={() => this.setState({ selectingPeer: false })}
        animationType="slide"
      >
        <ScreenSelectPeer
          onCancel={() => this.setState({ selectingPeer: false })}
          selectPeer={p =>
            this.setState({
              selectedPeer: p,
              selectingPeer: false,
              scannedPeerCode: undefined
            })
          }
        />
      </Modal>
    );
  };

  render() {
    return (
      <View>
        <Button
          style={[shared.inCardButton]}
          onPress={() => {
            this.setState({
              transferring: !this.state.transferring
            });
            this.resetState();
          }}
        >
          Transfer funds to checking account
        </Button>
        {this._renderTransferring()}
        {this._renderModalSelectPeer()}
      </View>
    );
  }
}

export default withLnd(ComponentTransferToChecking);

const styles = StyleSheet.create({});
