import React, { Component } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import withLnd from "./withLnd";
import shared from "./SharedStyles";
import Button from "react-native-button";
import {
  orderNodesByLastUpdate,
  updateNodesInAndOutCounts,
  orderNodesByRtxScore
} from "./Utils";

class ScreenGraphList extends Component {
  constructor(props) {
    super(props);
    this.state = { nPeersToShow: 20 };
  }

  componentDidMount() {
    this.getGraph();
  }

  getGraph = async () => {
    try {
      const graph = await this.props.lndApi.graph();
      updateNodesInAndOutCounts(graph);
      orderNodesByRtxScore(graph);
      this.setState({ graph });
    } catch (err) {}
  };

  _renderGraphNode = n => {
    const lastUpdate = new Date();
    lastUpdate.setTime(parseInt(n.last_update) * 1000);

    const errorKey = "error" + n.pub_key;
    const successKey = "success" + n.pub_key;
    return (
      <View style={styles.nodeItem}>
        <Text>
          <Text style={shared.boldText}>alias:</Text>
          {n.alias}
        </Text>
        <Text>
          <Text style={shared.boldText}>pubkey:</Text>
          {n.pub_key}
        </Text>
        <Text>
          <Text style={shared.boldText}>last updated:</Text>
          {lastUpdate.toDateString() || "No last_update found for node."}
        </Text>
        <Text>
          <Text style={shared.boldText}>#in channel count:</Text>
          {n.in_count}
          {"  "}
          <Text style={shared.boldText}>#out channel count:</Text>
          {n.out_count}
        </Text>
        <Text>
          <Text style={shared.boldText}>#in capacity:</Text>
          {n.in_capacity}
        </Text>
        <Button
          style={[shared.smallButton, shared.textAlignLeft]}
          onPress={async () => {
            try {
              if (!n.addresses || (n.addresses && n.addresses.length == 0)) {
                this.setState({
                  [errorKey]: "This peer doesn't have any addresses."
                });
                return;
              }
              const { addr } = n.addresses[0];
              const res = await this.props.lndApi.addPeers(
                n.pub_key,
                addr,
                true
              );
              if (res && !res.error) {
                this.setState({ [successKey]: "Connected!" });
              } else if (res.error) {
                this.setState({ [errorKey]: res.error });
              }
            } catch (err) {
              this.setState({ [errorKey]: err });
            }
          }}
        >
          Connect
        </Button>
        {this.state[errorKey] && <Text>{this.state[errorKey]}</Text>}
        {this.state[successKey] && <Text>{this.state[successKey]}</Text>}
      </View>
    );
  };

  _renderGraphList = () => {
    if (!this.state.graph || !this.state.graph.nodes)
      return <ActivityIndicator />;
    const filtered = this.state.graph.nodes.filter(
      n =>
        !this.state.filter_to ||
        this.state.filter_to == "" ||
        ((n.pub_key && n.pub_key.includes(this.state.filter_to)) ||
          (n.alias && n.alias.includes(this.state.filter_to)))
    );
    return (
      <View>
        {filtered.slice(0, this.state.nPeersToShow).map((n, i) => {
          return <View key={i}>{this._renderGraphNode(n)}</View>;
        })}

        <Button
          style={[shared.inCardButton]}
          onPress={() => {
            this.setState({ nPeersToShow: this.state.nPeersToShow + 20 });
          }}
        >
          Show more (showing{" "}
          {filtered.length > this.state.nPeersToShow
            ? this.state.nPeersToShow
            : filtered.length}{" "}
          out of {filtered.length} nodes)
        </Button>
      </View>
    );
  };

  _renderFilterInput = () => {
    return (
      <View style={styles.filterContainer}>
        <TextInput
          style={[shared.textInput]}
          underlineColorAndroid="transparent"
          placeholder="Filter nodes (pubkey and alias)"
          value={this.state.filter_to}
          onChangeText={text => this.setState({ filter_to: text })}
        />
      </View>
    );
  };

  render() {
    return (
      <View style={[shared.containerStyleOnly, shared.flexOne]}>
        {this._renderFilterInput()}
        <View style={styles.scrollContainer}>
          <ScrollView contentContainerStyle={styles.scrollStyle}>
            {this._renderGraphList()}
          </ScrollView>
        </View>
        <View style={[styles.actionContainer, shared.centerPrimaryAxis]}>
          <Button
            style={[shared.inCardButton, shared.cancelButton]}
            onPress={this.props.onCancel}
          >
            Cancel
          </Button>
        </View>
      </View>
    );
  }
}

export default withLnd(ScreenGraphList);

const styles = StyleSheet.create({
  nodeItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: "#BDBDBD"
  },
  filterContainer: {
    flex: 1,
    borderBottomWidth: 1,
    borderColor: "gray"
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
