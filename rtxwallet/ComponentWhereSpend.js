import React, { Component } from "react";
import { Linking, StyleSheet, Text, View } from "react-native";
import shared from "./SharedStyles";
import Button from "react-native-button";

export default class ComponentWhereSpend extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  _renderLink = link => {
    return (
      <View>
        <Button
          style={[shared.smallButton]}
          onPress={() => {
            Linking.openURL(link);
          }}
        >
          {link}
        </Button>
      </View>
    );
  };

  _renderShowing = () => {
    if (!this.state.showing) return;
    return (
      <View>
        {this._renderLink("https://yalls.org")}
        {this._renderLink("https://starblocks.acinq.co/")}
        {this._renderLink("https://htlc.me/")}
      </View>
    );
  };

  render() {
    return (
      <View>
        <Button
          style={[shared.inCardButton]}
          onPress={async () => {
            this.setState({
              showing: !this.state.showing
            });
          }}
        >
          Where can I spend my coins ?
        </Button>
        {this._renderShowing()}
      </View>
    );
  }
}

const styles = StyleSheet.create({});
