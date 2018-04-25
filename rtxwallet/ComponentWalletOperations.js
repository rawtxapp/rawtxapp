import React, { Component } from "react";
import { StyleSheet, Text, View } from "react-native";
import withLnd from "./withLnd";
import shared from "./SharedStyles";
import Button from "react-native-button";
import Modal from "react-native-modal";
import ScreenGraphList from "./ScreenGraphList";

class ComponentWalletOperations extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {}

  _renderShowGraphNodes() {
    const cancelOp = () => this.setState({ showingGraphNodes: false });
    return (
      <View>
        <Button
          style={[shared.inCardButton]}
          onPress={() => this.setState({ showingGraphNodes: true })}
        >
          Show network graph nodes
        </Button>

        <Modal
          isVisible={this.state.showingGraphNodes}
          onBackdropPress={cancelOp}
        >
          <ScreenGraphList onCancel={cancelOp} />
        </Modal>
      </View>
    );
  }

  render() {
    return (
      <View style={shared.container}>
        <Text style={shared.accountHeader}>Wallet operations</Text>
        <View style={shared.separator} />
        {this._renderShowGraphNodes()}
      </View>
    );
  }
}

export default withLnd(ComponentWalletOperations);

const styles = StyleSheet.create({});
