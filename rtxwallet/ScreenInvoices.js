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
  sortPaymentsByCreationDateDescending,
  sortBySettleDateDescending
} from "./Utils";

class ScreenInvoices extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    this.getInvoices();
  }

  getInvoices = async () => {
    try {
      const { invoices } = await this.props.lndApi.getInvoices();
      const settledInvoices = [];
      const unsettledInvoices = [];

      for (let i = 0; i < invoices.length; i++) {
        if (invoices[i].settled) {
          settledInvoices.push(invoices[i]);
        } else {
          unsettledInvoices.push(invoices[i]);
        }
      }
      sortBySettleDateDescending(settledInvoices);
      sortPaymentsByCreationDateDescending(unsettledInvoices);

      const finalInvoices = [];
      settledInvoices.forEach(i => finalInvoices.push(i));
      unsettledInvoices.forEach(i => finalInvoices.push(i));
      this.setState({ invoices: finalInvoices });
    } catch (err) {}
  };

  _renderInvoice = ({ item: n }) => {
    const creationDate = new Date();
    creationDate.setTime(parseInt(n.creation_date) * 1000);

    const settleDate = new Date();
    settleDate.setTime(parseInt(n.settle_date) * 1000);

    return (
      <View style={styles.nodeItem}>
        <Text selectable>
          <Text style={shared.boldText}>memo:</Text>
          {n.memo}
        </Text>
        <Text selectable>
          <Text style={shared.boldText}>creation date:</Text>
          {creationDate.toDateString() + " " + creationDate.toTimeString() ||
            "No creation date found."}
        </Text>
        {n.settled && (
          <Text selectable>
            <Text style={shared.boldText}>settle date:</Text>
            {settleDate.toDateString() + " " + settleDate.toTimeString() ||
              "No settle date found."}
          </Text>
        )}
        <Text>
          <Text style={shared.boldText}>value:</Text>
          {this.props.displaySatoshi(n.value) || 0}
        </Text>
        {n.private && (
          <Text selectable>
            <Text style={shared.boldText}>private</Text>
          </Text>
        )}
      </View>
    );
  };

  _keyExtractor = (i, ix) => i.r_preimage;

  _renderFlatList = () => {
    if (!this.state.invoices) return <ActivityIndicator />;
    return (
      <FlatList
        data={this.state.invoices}
        renderItem={this._renderInvoice}
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

export default withLnd(ScreenInvoices);

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
