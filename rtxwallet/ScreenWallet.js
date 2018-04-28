import React, { Component } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  View,
  Text,
  TextInput
} from "react-native";
import withLnd from "./withLnd.js";
import TimerMixin from "react-timer-mixin";
import ReactMixin from "react-mixin";
import { LOGO_COLOR } from "./Colors.js";
import { timeout } from "./Utils.js";

import Button from "react-native-button";
import shared from "./SharedStyles.js";

import ComponentPayInvoiceButtonInCard from "./ComponentPayInvoiceButtonInCard.js";
import ComponentTransferToChecking from "./ComponentTransferToChecking.js";
import ComponentWalletOperations from "./ComponentWalletOperations.js";

class SyncingBlock extends Component {
  render() {
    const { getinfo } = this.props;
    let status;
    let statusStyle;
    if (getinfo && getinfo["synced_to_chain"]) {
      status = "Synced to the chain!";
      statusStyle = syncingStyles.syncedText;
    } else {
      status = "Syncing to the chain";
      if (getinfo && getinfo["block_height"]) {
        status += " (block height: " + getinfo["block_height"] + ")";
      }
      status += "...";
      statusStyle = syncingStyles.unsynced;
    }
    return (
      <View style={shared.container}>
        <Text style={[shared.accountHeader, statusStyle]}>{status}</Text>
      </View>
    );
  }
}

class CheckingAccount extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    this.balanceListener_ = this.props.walletListener.listenToBalanceChannels(
      balance => this.setState({ balance })
    );
  }

  componentWillUnmount() {
    this.balanceListener_.remove();
  }

  render() {
    return (
      <View style={shared.container}>
        <Text style={shared.accountHeader}>Checking account</Text>
        <Text style={shared.baseText}>
          Balance:{" "}
          {this.props.displaySatoshi(
            (this.state.balance && this.state.balance.balance) || "0"
          )}
        </Text>
        <Text style={shared.baseText}>
          Pending open balance:{" "}
          {this.props.displaySatoshi(
            (this.state.balance && this.state.balance.pending_open_balance) ||
              "0"
          )}
        </Text>
        <View style={shared.separator} />
        <ComponentPayInvoiceButtonInCard />
      </View>
    );
  }
}

const CheckingAccountWithLnd = withLnd(CheckingAccount);

class SavingsAccount extends Component {
  constructor(props) {
    super(props);
    this.state = {
      balance: {},
      generatedAddress: "",
      showingGeneratedAddress: false,
      showingSelectPeers: false,
      showingTransferToChecking: false
    };
  }
  componentDidMount() {
    this.balanceListener_ = this.props.walletListener.listenToBalanceBlockchain(
      balance => this.setState({ balance })
    );
  }
  componentWillUnmount() {
    this.balanceListener_.remove();
  }

  render() {
    return (
      <View style={shared.container}>
        <Text style={shared.accountHeader}>Savings account</Text>
        <Text style={shared.baseText}>
          Total balance:{" "}
          {this.props.displaySatoshi(
            (this.state.balance && this.state.balance.total_balance) || "0"
          )}
        </Text>
        <Text style={shared.baseText}>
          Confirmed balance:{" "}
          {this.props.displaySatoshi(
            (this.state.balance && this.state.balance.confirmed_balance) || "0"
          )}
        </Text>
        <Text style={shared.baseText}>
          Unconfirmed balance:{" "}
          {this.props.displaySatoshi(
            (this.state.balance && this.state.balance.unconfirmed_balance) ||
              "0"
          )}
        </Text>

        <View style={shared.separator} />
        <Button
          style={[shared.inCardButton]}
          onPress={async () => {
            try {
              const newaddress = await this.props.lndApi.newaddress();
              this.setState({
                generatedAddress: newaddress["address"],
                showingGeneratedAddress: true
              });
            } catch (err) {}
          }}
        >
          Generate address to receive
        </Button>
        {this.state.showingGeneratedAddress && (
          <View>
            <Text style={shared.selectableText} selectable>
              {this.state.generatedAddress}
            </Text>

            <Button
              style={[shared.inCardButton]}
              onPress={() => {
                this.setState({ showingGeneratedAddress: false });
              }}
            >
              Dismiss
            </Button>
          </View>
        )}

        <View style={shared.separator} />
        <ComponentTransferToChecking />
      </View>
    );
  }
}

const SavingsAccountWithLnd = withLnd(SavingsAccount);

class ScreenWallet extends Component {
  constructor(props) {
    super(props);
    this.state = { wallet: undefined, getinfo: undefined, working: false };
  }

  componentDidMount() {
    this.setRunningWallet();
    this.props.walletListener.startWatching();
    this.getInfoListener_ = this.props.walletListener.listenToGetInfo(
      getinfo => {
        this.setState({ getinfo });
      }
    );
  }

  componentWillUnmount() {
    this.getInfoListener_.remove();
  }

  setRunningWallet = async () => {
    if (!this.state.wallet) {
      try {
        const wallet = await this.props.getRunningWallet();
        this.setState({ wallet });
      } catch (err) {
        this.setTimeout(this.setRunningWallet, 1000);
      }
    }
  };

  render() {
    let content;

    let footer = (
      <View>
        <Button
          style={[shared.container, styles.closeWalletButton]}
          onPress={async () => {
            this.setState({ working: true }, async () => {
              await this.props.stopLndFromWallet(this.state.wallet);
              this.props.navigation.navigate("WalletCreate");
            });
          }}
        >
          Close wallet
        </Button>
      </View>
    );

    if (!this.state.wallet || !this.state.getinfo || this.state.working) {
      content = (
        <View>
          <ActivityIndicator />
        </View>
      );
    } else if (false) {
      content = (
        <View>
          <Text>{JSON.stringify(this.state.wallet)}</Text>
          <Text>{JSON.stringify(this.state.getinfo)}</Text>
          <Button
            onPress={async () => {
              await this.props.stopLndFromWallet(this.state.wallet);
              this.props.navigation.navigate("WalletCreate");
            }}
          >
            Close wallet
          </Button>
        </View>
      );
    } else {
      content = (
        <View>
          <SyncingBlock getinfo={this.state.getinfo} />
          <CheckingAccountWithLnd />
          <SavingsAccountWithLnd />
          <ComponentWalletOperations />
          {footer}
        </View>
      );
    }

    return (
      <ScrollView style={styles.container}>
        <View style={styles.logoContainer}>
          <Image
            source={require("./assets/intro-logo.png")}
            style={{
              width: undefined,
              height: 80
            }}
            resizeMode="contain"
          />
        </View>
        <View style={styles.restContainer}>{content}</View>
      </ScrollView>
    );
  }
}

ReactMixin(ScreenWallet.prototype, TimerMixin);
export default withLnd(ScreenWallet);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LOGO_COLOR
  },
  logoContainer: {
    flex: 1
  },
  restContainer: {
    flex: 8
  },
  closeWalletButton: {
    color: "red"
  }
});

const syncingStyles = StyleSheet.create({
  syncedText: {
    color: "green"
  },
  unsynced: {
    color: "orange"
  }
});
