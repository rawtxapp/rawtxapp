import React, { Component } from "react";
import { FlatList, StyleSheet, View, Text } from "react-native";
import withLnd from "./withLnd.js";
import Button from "react-native-button";
import { styles as theme } from "react-native-theme";
import { RenderNodeInfoItem } from "./ComponentShared";

class ScreenSelectPeer extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    this.getPeers();
  }

  getPeers = async () => {
    try {
      const { peers } = await this.props.lndApi.peers();
      this.setState({ nodeInfos: peers });
      const nodeInfoPromises = peers.map(p =>
        this.props.lndApi.getNodeInfo(p.pub_key)
      );
      let foundError = false;
      const nodeInfos = (await Promise.all(nodeInfoPromises)).map(ni => {
        if (ni.error) {
          foundError = true;
        }
        return ni.node;
      });
      if (foundError) {
        return;
      }
      this.setState({ nodeInfos });
    } catch (err) {}
  };

  _keyExtractor = (i, ix) => i.pub_key;

  _renderGraphNode = ({ item: n }) => {
    const lastUpdate = new Date();
    lastUpdate.setTime(parseInt(n.last_update) * 1000);

    return (
      <View style={styles.nodeItem}>
        {!!n.alias && (
          <Text>
            <Text style={theme.boldText}>alias:</Text>
            {n.alias}
          </Text>
        )}
        <Text>
          <Text style={theme.boldText}>pubkey:</Text>
          {n.pub_key}
        </Text>
        <Text>
          <Text style={theme.boldText}>last updated:</Text>
          {lastUpdate.toDateString() || "No last_update found for node."}
        </Text>
        <Button
          style={[theme.smallButton, theme.textAlignLeft]}
          onPress={() => this.props.selectPeer(n)}
        >
          Open channel to peer
        </Button>
      </View>
    );
  };

  render() {
    return (
      <View style={theme.flexOne}>
        <View style={styles.scrollContainer}>
          <FlatList
            data={this.state.nodeInfos}
            renderItem={this._renderGraphNode}
            keyExtractor={this._keyExtractor}
          />
        </View>
        <View style={[styles.actionContainer, theme.centerPrimaryAxis]}>
          <Button onPress={this.props.onCancel} style={theme.cancelButton}>
            Cancel
          </Button>
        </View>
      </View>
    );
  }
}

export default withLnd(ScreenSelectPeer);

const styles = StyleSheet.create({
  nodeItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: "#BDBDBD"
  },
  scrollContainer: {
    flex: 9
  },
  actionContainer: {
    flex: 1,
    borderTopWidth: 1,
    borderColor: "gray"
  }
});
