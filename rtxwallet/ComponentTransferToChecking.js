import React, { Component } from "react";
import { StyleSheet, View, Text, TextInput } from "react-native";

import Modal from "react-native-modal";
import shared from "./SharedStyles.js";
import Button from "react-native-button";
import withLnd from "./withLnd.js";
import ScreenSelectPeer from "./ScreenSelectPeer.js";
import ScreenQRCodeScan from "./ScreenQRCodeScan.js";

class ComponentTransferToChecking extends Component {
  constructor(props) {
    super(props);
    this.state = {
      transferring: false,
      selectingPeer: false,
      selectedPeer: undefined,
      amount: ""
    };
  }

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
            if (this.state.scannedPeerCode) {
              const splitted = this.state.scannedPeerCode.split("@");
              //Connect to the peer first
              await this.props.lndApi.addPeers(splitted[0], splitted[1], true);
            }
            const res = await this.props.lndApi.openChannel({
              node_pubkey_string: peerPubkey,
              local_funding_amount: this.props.displayUnitToSatoshi(
                this.state.amount
              )
            });
          }}
        >
          Create channel
        </Button>
      </View>
    );
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
          onPress={() => this.setState({ scanningQR: true })}
          style={shared.inCardButton}
        >
          Create new channel to a peer by QR code
        </Button>
        {this._renderSelectedPeer()}
        <Button
          onPress={() =>
            this.setState({
              transferring: false,
              selectedPeer: undefined,
              scannedPeerCode: undefined
            })
          }
          style={[shared.inCardButton, shared.cancelButton]}
        >
          Cancel transfer
        </Button>
      </View>
    );
  };

  _renderModalSelectPeer = () => {
    return (
      <Modal
        isVisible={this.state.selectingPeer}
        onBackdropPress={() => this.setState({ selectingPeer: false })}
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

  _renderModalChannelPeerQR = () => {
    return (
      <Modal
        isVisible={this.state.scanningQR}
        onBackdropPress={() => this.setState({ scanningQR: false })}
      >
        <ScreenQRCodeScan
          instructions={"Point the camera to the peer's QR code."}
          dismiss={() => this.setState({ scanningQR: false })}
          qrScanned={qr => {
            this.setState({
              scanningQR: false,
              scannedPeerCode: qr,
              selectedPeer: undefined,
              error: ""
            });
          }}
        />
      </Modal>
    );
  };

  render() {
    return (
      <View>
        <Button
          style={[shared.inCardButton]}
          onPress={async () => {
            this.setState({
              transferring: true
            });
          }}
        >
          Transfer funds to checking account
        </Button>
        {this._renderTransferring()}
        {this._renderModalSelectPeer()}
        {this._renderModalChannelPeerQR()}
      </View>
    );
  }
}

export default withLnd(ComponentTransferToChecking);

const styles = StyleSheet.create({});
