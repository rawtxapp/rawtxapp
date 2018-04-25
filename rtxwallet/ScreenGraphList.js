import React, { Component } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import withLnd from "./withLnd";
import shared from "./SharedStyles";
import Button from "react-native-button";
import { orderNodesByLastUpdate, updateNodesInAndOutCounts } from "./Utils";

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
      orderNodesByLastUpdate(graph);
      updateNodesInAndOutCounts(graph);
      this.setState({ graph });
    } catch (err) {}
  };

  _renderGraphNode = n => {
    const lastUpdate = new Date();
    lastUpdate.setTime(parseInt(n.last_update) * 1000);
    return (
      <View style={styles.nodeItem}>
        <Text>{n.alias}</Text>
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
      </View>
    );
  };

  _renderGraphList = () => {
    if (!this.state.graph || !this.state.graph.nodes)
      return <ActivityIndicator />;
    return (
      <View>
        {this.state.graph.nodes
          .slice(0, this.state.nPeersToShow)
          .map((n, i) => {
            return <View key={i}>{this._renderGraphNode(n)}</View>;
          })}

        <Button
          style={[shared.inCardButton]}
          onPress={() => {
            this.setState({ nPeersToShow: this.state.nPeersToShow + 20 });
          }}
        >
          Show more (showing {this.state.nPeersToShow} out of{" "}
          {this.state.graph.nodes.length} nodes)
        </Button>
      </View>
    );
  };

  render() {
    return (
      <View style={[shared.containerStyleOnly, shared.flexOne]}>
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
  scrollContainer: {
    flex: 9
  },
  actionContainer: {
    flex: 1
  }
});
