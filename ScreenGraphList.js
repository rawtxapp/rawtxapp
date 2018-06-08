import React, { Component } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import withLnd from "./withLnd";
import { styles as theme } from "react-native-theme";
import Button from "react-native-button";
import {
  orderNodesByLastUpdate,
  updateNodesInAndOutCounts,
  orderNodesByRtxScore
} from "./Utils";

const { height } = Dimensions.get("screen");

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

  _renderGraphNode = ({ item: n }) => {
    const lastUpdate = new Date();
    lastUpdate.setTime(parseInt(n.last_update) * 1000);

    const errorKey = "error" + n.pub_key;
    const successKey = "success" + n.pub_key;
    return (
      <View style={styles.nodeItem}>
        <Text>
          <Text style={theme.boldText}>alias:</Text>
          {n.alias}
        </Text>
        <Text selectable>
          <Text style={theme.boldText}>pubkey:</Text>
          {n.pub_key}
        </Text>
        <Text>
          <Text style={theme.boldText}>last updated:</Text>
          {lastUpdate.toDateString() || "No last_update found for node."}
        </Text>
        <Text>
          <Text style={theme.boldText}>#in channel count:</Text>
          {n.in_count}
          {"  "}
          <Text style={theme.boldText}>#out channel count:</Text>
          {n.out_count}
        </Text>
        <Text>
          <Text style={theme.boldText}>#in capacity:</Text>
          {n.in_capacity}
        </Text>
        <Button
          style={[theme.smallButton, theme.textAlignLeft]}
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

  _renderFilterInput = () => {
    return (
      <View style={styles.filterContainer}>
        <TextInput
          style={[theme.textInput]}
          underlineColorAndroid="transparent"
          placeholder="Filter nodes (pubkey and alias)"
          value={this.state.filter_to}
          onChangeText={text => this.setState({ filter_to: text })}
        />
      </View>
    );
  };

  _keyExtractor = (i, ix) => i.pub_key;

  _renderFlatList = () => {
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
      <View style={styles.listContainer}>
        <FlatList
          data={filtered}
          renderItem={this._renderGraphNode}
          keyExtractor={this._keyExtractor}
        />
      </View>
    );
  };

  render() {
    return (
      <View>
        {this._renderFilterInput()}
        {this._renderFlatList()}
      </View>
    );
  }
}

export default withLnd(ScreenGraphList);

const styles = StyleSheet.create({
  listContainer: {
    maxHeight: height * 0.7
  },
  nodeItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: "#BDBDBD"
  },
  filterContainer: {
    borderBottomWidth: 1,
    borderColor: "gray"
  }
});
