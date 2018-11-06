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

class ScreenTransactions extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    this.getPayments();
    this.getInvoices();
  }

  setTransactions = () => {
    // transactions is formatted [{title:'<DATE>', data:[<PAYMENTS_INVOICES>]}]
    const txs = this.state.transactions || [];
    payments = this.state.payments;
    invoices = this.state.invoices;

    if (!payments || !invoices) return;

    // SectionList takes [{dateKey,value},{dateKey,value},...], but we don't
    // want to search the list for every dateKey insertion, so keep track of
    // indexes.
    const dateToIx = {};
    for (let i = 0; i < txs.length; i++) {
      dateToIx[txs[i].title] = i;
    }

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

    for (let i = 0; i < payments.length; i++) {
      pushToDate(payments[i], payments[i].creation_date);
    }

    for (let i = 0; i < invoices.length; i++) {
      pushToDate(invoices[i], invoices[i].settle_date);
    }

    sortTransactions(txs);
    this.setState({ transactions: txs });
  };

  getPayments = async () => {
    const setPayments = payments => {
      this.setState({ payments }, () => {
        this.setTransactions();
      });
    };
    try {
      const { payments } = await this.props.lndApi.getPayments();
      payments = payments || [];
      setPayments(payments);
    } catch (err) {
      setPayments([]);
    }
  };

  getInvoices = async () => {
    const setInvoices = invoices => {
      this.setState({ invoices }, () => {
        this.setTransactions();
      });
    };
    try {
      const { invoices } = await this.props.lndApi.getInvoices();
      const settledInvoices = [];

      for (let i = 0; i < invoices.length; i++) {
        if (invoices[i].settled) {
          settledInvoices.push(invoices[i]);
        }
      }
      settledInvoices = settledInvoices || [];
      setInvoices(settledInvoices);
    } catch (err) {
      setInvoices([]);
    }
  };

  _renderPayment = ({ item: n }) => {
    const creationDate = new Date();
    creationDate.setTime(parseInt(n.creation_date) * 1000);

    return (
      <View style={[styles.nodeItem]}>
        <View style={styles.leftContainer}>
          <Text selectable>{n.memo}</Text>
          <Text selectable>{n.payment_hash}</Text>
          <Text selectable style={theme.boldText}>
            {creationDate.toTimeString().substr(0, 5) ||
              "No creation date found."}
          </Text>
        </View>
        <View style={styles.rightContainer}>
          <View
            style={
              n.settled
                ? theme.channelStatusActiveContainer
                : theme.channelStatusInactiveContainer
            }
          >
            <Text
              selectable
              style={
                n.settled
                  ? theme.successTextColorOnly
                  : theme.errorTextColorOnly
              }
            >
              {this.props.displaySatoshi(n.value)}
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

export default withTheme(withLnd(ScreenTransactions));

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
