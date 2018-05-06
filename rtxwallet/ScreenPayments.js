import React, { Component } from "react";
import {
  ActivityIndicator,
  FlatList,
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
  orderNodesByRtxScore,
  sortPaymentsByCreationDateDescending
} from "./Utils";

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
      this.setState({ payments });
    } catch (err) {}
  };

  _renderPayment = ({ item: n }) => {
    const creationDate = new Date();
    creationDate.setTime(parseInt(n.creation_date) * 1000);

    return (
      <View style={styles.nodeItem}>
        <Text selectable>
          <Text style={shared.boldText}>payment hash:</Text>
          {n.payment_hash}
        </Text>
        <Text selectable>
          <Text style={shared.boldText}>value:</Text>
          {n.value}
        </Text>
        <Text selectable>
          <Text style={shared.boldText}>creation date:</Text>
          {creationDate.toDateString() + " " + creationDate.toTimeString() ||
            "No creation date found."}
        </Text>
        <Text>
          <Text style={shared.boldText}>fee:</Text>
          {n.fee || 0}
        </Text>
        <Text>
          <Text style={shared.boldText}>path length:</Text>
          {n.path.length}
        </Text>
        <Text selectable>
          <Text style={shared.boldText}>payment preimage:</Text>
          {n.payment_preimage}
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
      />
    );
  };

  render() {
    return (
      <View style={[shared.containerStyleOnly, shared.flexOne]}>
        <View style={styles.scrollContainer}>{this._renderFlatList()}</View>
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

export default withLnd(ScreenPayments);

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
