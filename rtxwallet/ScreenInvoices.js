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
  sortPaymentsByCreationDateDescending,
  sortBySettleDateDescending
} from "./Utils";
import withTheme from "./withTheme";

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
      LayoutAnimation.easeInEaseOut();
      this.setState({ invoices: finalInvoices });
    } catch (err) {
      this.setState({ invoices: [] });
    }
  };

  _renderInvoice = ({ item: n }) => {
    const creationDate = new Date();
    creationDate.setTime(parseInt(n.creation_date) * 1000);

    const settleDate = new Date();
    settleDate.setTime(parseInt(n.settle_date) * 1000);

    return (
      <View style={[styles.nodeItem, this.props.theme.actionContainer]}>
        {!!n.memo && (
          <Text selectable style={this.props.theme.actionContainerText}>
            <Text style={theme.boldText}>memo:</Text>
            {n.memo}
          </Text>
        )}
        <Text style={this.props.theme.actionContainerText}>
          <Text style={theme.boldText}>value:</Text>
          {this.props.displaySatoshi(n.value) || 0}
        </Text>
        <Text selectable style={this.props.theme.actionContainerText}>
          <Text style={theme.boldText}>creation date:</Text>
          {creationDate.toDateString() + " " + creationDate.toTimeString() ||
            "No creation date found."}
        </Text>
        {n.settled && (
          <Text selectable style={this.props.theme.actionContainerText}>
            <Text style={theme.boldText}>settle date:</Text>
            {settleDate.toDateString() + " " + settleDate.toTimeString() ||
              "No settle date found."}
          </Text>
        )}
        {n.private && (
          <Text selectable style={this.props.theme.actionContainerText}>
            <Text style={theme.boldText}>private</Text>
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
        ListEmptyComponent={<Text>There are no invoices.</Text>}
        ItemSeparatorComponent={() => (
          <View style={this.props.theme.separator} />
        )}
      />
    );
  };

  render() {
    return <View>{this._renderFlatList()}</View>;
  }
}

export default withTheme(withLnd(ScreenInvoices));

const styles = StyleSheet.create({
  nodeItem: {
    padding: 10
  }
});
