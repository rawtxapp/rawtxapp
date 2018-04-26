import React, { Component } from "react";
import { View, Text } from "react-native";
import withLnd from "./withLnd.js";
import Button from "react-native-button";
import shared from "./SharedStyles.js";

class ScreenSelectPeer extends Component {
  constructor(props) {
    super(props);
    this.state = { peers: [] };
  }

  componentDidMount() {
    this.getPeers();
  }

  getPeers = async () => {
    try {
      const { peers } = await this.props.lndApi.peers();
      this.setState({ peers });
    } catch (err) {}
  };

  render() {
    return (
      <View style={shared.container}>
        {this.state.peers &&
          this.state.peers.map((p, i) => (
            <View key={i}>
              <Button onPress={() => this.props.selectPeer(p)}>
                {p.pub_key}
              </Button>
              <View style={shared.separator} />
            </View>
          ))}
        <Button onPress={this.props.onCancel} style={shared.cancelButton}>
          Cancel
        </Button>
      </View>
    );
  }
}

export default withLnd(ScreenSelectPeer);
