import React, { Component } from "react";
import { Modal, StyleSheet, View, Text, TextInput } from "react-native";

import { styles as theme } from "react-native-theme";
import Button from "react-native-button";
import withLnd from "./withLnd.js";
import ScreenChannels from "./ScreenChannels.js";

class ComponentTransferToSavings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      transferring: false,
      selectingChannel: false
    };
  }

  _renderTransferring = () => {
    if (!this.state.transferring) return;
    return (
      <View>
        <Text style={theme.warningText}>
          To transfer funds to saving account, you need to close channels:
        </Text>
        <Button
          onPress={() => this.setState({ selectingChannel: true })}
          style={theme.inCardButton}
        >
          Select channels to close
        </Button>
      </View>
    );
  };

  _renderModal = () => {
    const closeModal = () => this.setState({ selectingChannel: false });
    return (
      <Modal
        visible={this.state.selectingChannel}
        onRequestClose={closeModal}
        animationType="slide"
      >
        <ScreenChannels onDone={closeModal} />
      </Modal>
    );
  };

  render() {
    return (
      <View>
        <Button
          style={[theme.inCardButton]}
          onPress={async () => {
            this.setState({
              transferring: !this.state.transferring
            });
          }}
        >
          Transfer funds to savings account
        </Button>
        {this._renderTransferring()}
        {this._renderModal()}
      </View>
    );
  }
}

export default withLnd(ComponentTransferToSavings);

const styles = StyleSheet.create({});
