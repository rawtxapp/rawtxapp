import React, { Component } from "react";
import {
  ActivityIndicator,
  FlatList,
  LayoutAnimation,
  SectionList,
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
  sortTransactions
} from "./Utils";
import withTheme from "./withTheme";

class ScreenBlockchainTransactions extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    this.getTransactions();
  }

  getTransactions = async () => {
    try {
      let {
        transactions
      } = await this.props.lndApi.getBlockchainTransactions();
      transactions = transactions || [];
      const txs = [];

      const dateToIx = {};

      const pushToDate = (obj, time) => {
        const d = new Date(parseInt(time) * 1000);
        const date = d.toDateString();

        if (date in dateToIx) {
          const ix = dateToIx[date];
          txs[ix].data.push(obj);
        } else {
          const newLength = txs.push({ title: date, data: [obj] });
          dateToIx[date] = newLength - 1;
        }
      };

      for (let i = 0; i < transactions.length; i++) {
        pushToDate(transactions[i], transactions[i].time_stamp);
      }

      sortTransactions(txs);
      this.setState({ transactions: txs });
    } catch (err) {
      console.error(err);
    }
  };

  _renderPayment = ({ item: n }) => {
    const creationDate = new Date();
    creationDate.setTime(parseInt(n.creation_date) * 1000);

    return (
      <View style={[styles.nodeItem]}>
        <View style={styles.leftContainer}>
          <Text selectable>{n.tx_hash}</Text>
          <Text selectable style={theme.boldText}>
            num confirmation: {n.num_confirmations || "unconfirmed"}
          </Text>
        </View>
        <View style={styles.rightContainer}>
          <View
            style={
              n.amount > 0
                ? theme.channelStatusActiveContainer
                : theme.channelStatusInactiveContainer
            }
          >
            <Text
              selectable
              style={
                n.amount > 0
                  ? theme.successTextColorOnly
                  : theme.errorTextColorOnly
              }
            >
              {this.props.displaySatoshi(Math.abs(n.amount))}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  _keyExtractor = (i, ix) => i.payment_hash || i.r_hash;

  _renderSectionList = () => {
    if (!this.state.transactions) return <ActivityIndicator />;
    return (
      <SectionList
        sections={this.state.transactions}
        renderItem={this._renderPayment}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={styles.sectionHeader}>{title}</Text>
        )}
        keyExtractor={this._keyExtractor}
        ListEmptyComponent={
          <Text style={styles.noTxContainer}>There are no transactions.</Text>
        }
        SectionSeparatorComponent={({ trailingItem }) =>
          trailingItem ? null : <View style={styles.separator} />
        }
      />
    );
  };

  render() {
    return (
      <View>
        <View style={styles.scrollContainer}>{this._renderSectionList()}</View>
      </View>
    );
  }
}

export default withTheme(withLnd(ScreenBlockchainTransactions));

const styles = StyleSheet.create({
  nodeItem: {
    padding: 10,
    flexDirection: "row"
  },
  sectionHeader: {
    marginLeft: 10,
    fontSize: 18
  },
  leftContainer: {
    flex: 1,
    justifyContent: "center"
  },
  rightContainer: {
    flex: 0,
    justifyContent: "center"
  },
  separator: {
    marginTop: 30
  },
  noTxContainer: {
    paddingHorizontal: 10
  }
});
