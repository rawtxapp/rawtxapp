import React, { Component } from "react";
import {
  ActivityIndicator,
  FlatList,
  LayoutAnimation,
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
  orderNodesByRtxScore,
  sortPaymentsByCreationDateDescending
} from "./Utils";
import withTheme from "./withTheme";

class ScreenPayments extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    this.getPayments();
  }

  getPayments = async () => {
    try {
      const { payments } = await this.props.lndApi.getPayments();
      sortPaymentsByCreationDateDescending(payments);
      LayoutAnimation.easeInEaseOut();
      this.setState({ payments: payments || [] });
    } catch (err) {
      this.setState({ payments: [] });
    }
  };

  _renderPayment = ({ item: n }) => {
    const creationDate = new Date();
    creationDate.setTime(parseInt(n.creation_date) * 1000);

    return (
      <View style={[styles.nodeItem, this.props.theme.actionContainer]}>
        <Text selectable style={this.props.theme.actionContainerText}>
          <Text style={theme.boldText}>
            Paid {this.props.displaySatoshi(n.value)}
          </Text>
        </Text>
        <Text selectable style={this.props.theme.actionContainerText}>
          <Text style={theme.boldText}>on </Text>
          {creationDate.toDateString() + " " + creationDate.toTimeString() ||
            "No creation date found."}
        </Text>
        <Text style={this.props.theme.actionContainerText}>
          <Text style={theme.boldText}>fee:</Text>
          {n.fee || 0}
        </Text>
        <Text style={this.props.theme.actionContainerText}>
          <Text style={theme.boldText}>path length:</Text>
          {n.path.length}
        </Text>
        <Text selectable style={this.props.theme.actionContainerText}>
          <Text style={theme.boldText}>payment hash:</Text>
          {n.payment_hash}
        </Text>
      </View>
    );
  };

  _keyExtractor = (i, ix) => i.payment_hash;

  _renderFlatList = () => {
    if (!this.state.payments) return <ActivityIndicator />;
    return (
      <FlatList
        data={this.state.payments}
        renderItem={this._renderPayment}
        keyExtractor={this._keyExtractor}
        ListEmptyComponent={<Text>There are no payments.</Text>}
        ItemSeparatorComponent={() => (
          <View style={this.props.theme.separator} />
        )}
      />
    );
  };

  render() {
    return (
      <View>
        <View style={styles.scrollContainer}>{this._renderFlatList()}</View>
      </View>
    );
  }
}

export default withTheme(withLnd(ScreenPayments));

const styles = StyleSheet.create({
  nodeItem: {
    padding: 10
  }
});
