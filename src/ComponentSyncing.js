import React, { Component } from "react";
import { StyleSheet, Text, View } from "react-native";
import withLnd from "./withLnd.js";

class ComponentSyncing extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  componentDidMount() {
    this.getInfoListener_ = this.props.walletListener.listenToGetInfo(
      getinfo => {
        this.setState({ getinfo });
      }
    );
  }

  componentWillUnmount() {
    this.getInfoListener_.remove();
  }

  _renderSynced = () => {
    if (!this.state.getinfo || !this.state.getinfo["synced_to_chain"]) {
      return;
    }

    return <Text style={styles.synced}>Synced!</Text>;
  };

  _renderSyncing = () => {
    if (!this.state.getinfo || this.state.getinfo["synced_to_chain"]) {
      return;
    }

    let pct = "";
    if (this.state.getinfo["best_header_timestamp"]) {
      const currentProgress =
        parseInt(this.state.getinfo["best_header_timestamp"]) -
        this.props.GENESIS_BLOCK_TIMESTAMP;
      const total =
        new Date().getTime() / 1000 - this.props.GENESIS_BLOCK_TIMESTAMP;
      pct = currentProgress / total;
      pct *= 100;
      pct = pct > 99 ? 99 : pct;
      pct = "(" + pct.toFixed() + "%)";
    }

    return <Text style={styles.syncing}>Syncing {pct}</Text>;
  };

  render() {
    return (
      <View>
        {this._renderSynced()}
        {this._renderSyncing()}
      </View>
    );
  }
}

export default withLnd(ComponentSyncing);

const styles = StyleSheet.create({
  synced: {
    color: "green"
  },
  syncing: {
    color: "orange"
  }
});
