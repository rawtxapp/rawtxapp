import React, { Component } from "react";
import { AppState, Platform, View } from "react-native";
import withLnd from "./withLnd";

class WalletShutdownBackground extends Component {
  state = {
    appState: AppState.currentState
  };

  componentDidMount() {
    AppState.addEventListener("change", this._handleAppStateChange);
  }

  componentWillUnmount() {
    AppState.removeEventListener("change", this._handleAppStateChange);
  }

  _handleAppStateChange = async nextAppState => {
    if (nextAppState == "background") {
      // lndDir doesn't matter here, because we don't wait for shutdown
      this.props.stopLnd("");
    }
    this.setState({ appState: nextAppState });
  };

  render() {
    return <View />;
  }
}

export default withLnd(WalletShutdownBackground);
