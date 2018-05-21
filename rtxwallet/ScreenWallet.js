import React, { Component } from "react";
import {
  ActivityIndicator,
  Image,
  Linking,
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
import ComponentTransferToSavings from "./ComponentTransferToSavings.js";
import ComponentReceive from "./ComponentReceive.js";
import ComponentReceiveFaucet from "./ComponentReceiveFaucet.js";
import ScreenPayments from "./ScreenPayments.js";
import ScreenInvoices from "./ScreenInvoices";
import ComponentWhereSpend from "./ComponentWhereSpend.js";
import ComponentWelcome from "./ComponentWelcome";
import ComponentActionSheet from "./ComponentActionSheet";

class SyncingBlock extends Component {
  render() {
    const { getinfo } = this.props;
    let status;
    let statusStyle;
    if (getinfo && getinfo["synced_to_chain"]) {
      status = "Synced to the chain!";
      statusStyle = syncingStyles.syncedText;
    } else {
      status = "Syncing to the chain (some operations won't work)";
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
    this.state = { showingPayments: false, showingInvoices: false };
  }

  componentDidMount() {
    this.balanceListener_ = this.props.walletListener.listenToBalanceChannels(
      balance => this.setState({ balance })
    );
    this.pendingChannelListener_ = this.props.walletListener.listenToPendingChannels(
      pendingChannel => this.setState({ pendingChannel })
    );
    this.channelListener_ = this.props.walletListener.listenToChannels(
      ({ channels }) => this.setState({ channels })
    );
    this.getRunningWallet();
  }

  componentWillUnmount() {
    this.balanceListener_.remove();
    this.pendingChannelListener_.remove();
    this.channelListener_.remove();
  }

  getRunningWallet = async () => {
    const runningWallet = await this.props.getRunningWallet();
    this.setState({ runningWallet });
  };

  _renderChannelCount = () => {
    let total = 0;
    let active = 0;
    let pending_open = 0;
    let pending_close = 0;
    if (this.state.channels) {
      const c = this.state.channels;
      total = c.length;
      for (let i = 0; i < c.length; i++) {
        if (c[i].active) {
          active++;
        }
      }
    }

    if (this.state.pendingChannel) {
      const {
        pending_open_channels,
        pending_closing_channels,
        pending_force_closing_channels
      } = this.state.pendingChannel;
      pending_open =
        (pending_open_channels && pending_open_channels.length) || 0;
      pending_close =
        pending_closing_channels && pending_closing_channels.length;
      pending_force_close =
        pending_force_closing_channels && pending_force_closing_channels.length;
      pending_close = (pending_close || 0) + (pending_force_close || 0);
    }
    const inactive = total - active;
    const hasPending = pending_open > 0 || pending_close > 0 || inactive > 0;

    return (
      <View>
        <Text>
          <Text style={shared.boldText}>Channels:</Text>
          {active}
          {hasPending && (
            <Text>
              {" "}
              ({inactive > 0
                ? "inactive: " +
                  inactive +
                  (pending_open > 0 || pending_close > 0 ? ", " : "")
                : ""}
              {pending_open > 0
                ? "opening: " + pending_open + (pending_close > 0 ? ", " : "")
                : ""}
              {pending_close > 0 ? "closing: " + pending_close : ""})
            </Text>
          )}
        </Text>
      </View>
    );
  };

  _renderBalances = () => {
    const pendingOpen =
      this.state.balance && parseInt(this.state.balance.pending_open_balance);
    const limbo =
      this.state.pendingChannel &&
      parseInt(this.state.pendingChannel.total_limbo_balance);
    const hasOpen = pendingOpen > 0;
    const hasLimbo = limbo > 0;
    const hasOpenLimbo = hasOpen || hasLimbo;
    return (
      <View>
        <Text style={shared.baseText}>
          <Text style={shared.boldText}>Balance:</Text>{" "}
          {this.props.displaySatoshi(
            (this.state.balance && this.state.balance.balance) || "0"
          )}
          {hasOpenLimbo && (
            <Text>
              {" "}
              ({hasOpen
                ? "pending: +" +
                  this.props.displaySatoshi(pendingOpen) +
                  (hasLimbo ? ", " : "")
                : ""}
              {hasLimbo ? "limbo: " + this.props.displaySatoshi(limbo) : ""})
            </Text>
          )}
        </Text>
      </View>
    );
  };

  _renderFaucet = () => {
    if (
      !this.state.runningWallet ||
      this.state.runningWallet.coin != "bitcoin" ||
      this.state.runningWallet.network != "testnet"
    ) {
      return;
    }
    return <ComponentReceiveFaucet />;
  };

  _renderShowPayments = () => {
    const closeModal = () => this.setState({ showingPayments: false });
    return (
      <ComponentActionSheet
        visible={this.state.showingPayments}
        onRequestClose={closeModal}
        animationType="slide"
        buttonText="Done"
      >
        <ScreenPayments onCancel={closeModal} />
      </ComponentActionSheet>
    );
  };

  _renderShowInvoices = () => {
    const closeModal = () => this.setState({ showingInvoices: false });
    return (
      <Modal
        visible={this.state.showingInvoices}
        onRequestClose={closeModal}
        animationType="slide"
      >
        <ScreenInvoices onCancel={closeModal} />
      </Modal>
    );
  };

  render() {
    return (
      <View style={shared.container}>
        <Text style={shared.accountHeader}>
          Checking account{" "}
          <Text style={shared.smallerHeader}>(funds on channels)</Text>
        </Text>
        {this._renderBalances()}
        {this._renderChannelCount()}
        <View style={{ flexDirection: "row" }}>
          <Button
            containerStyle={{
              borderRadius: 10,
              backgroundColor: LOGO_COLOR,
              flex: 1,
              margin: 5,
              padding: 5
            }}
            style={{ color: "white" }}
            onPress={() => {
              this.setState({
                showingPayments: true
              });
            }}
          >
            Show payments
          </Button>
          <Button
            containerStyle={{
              borderRadius: 10,
              backgroundColor: LOGO_COLOR,
              flex: 1,
              margin: 5,
              padding: 5
            }}
            style={{ color: "white" }}
            onPress={() => {
              this.setState({
                showingInvoices: true
              });
            }}
          >
            Show invoices
          </Button>
        </View>
        {this._renderFaucet()}
        <View style={shared.separator} />
        <ComponentPayInvoiceButtonInCard />
        <View style={shared.separator} />
        <ComponentReceive />
        <View style={shared.separator} />
        <ComponentTransferToSavings />
        {this._renderShowPayments()}
        {this._renderShowInvoices()}
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
    this.pendingChannelListener_ = this.props.walletListener.listenToPendingChannels(
      pendingChannel => this.setState({ pendingChannel })
    );
  }
  componentWillUnmount() {
    this.balanceListener_.remove();
    this.pendingChannelListener_.remove();
  }

  _renderBalances = () => {
    const unconfirmed =
      (this.state.balance &&
        parseInt(this.state.balance.unconfirmed_balance)) ||
      0;
    return (
      <View>
        <Text style={shared.baseText}>
          <Text style={shared.boldText}>Balance:</Text>{" "}
          {this.props.displaySatoshi(
            (this.state.balance && this.state.balance.confirmed_balance) || "0"
          )}
          {unconfirmed > 0 && (
            <Text>
              {" "}
              (unconfirmed: {this.props.displaySatoshi(unconfirmed)})
            </Text>
          )}
        </Text>
        {this.state.pendingChannel &&
          this.state.pendingChannel.pending_open_channels &&
          this.state.pendingChannel.pending_open_channels.length > 0 && (
            <Text style={shared.warningText}>
              Your balance could be lower than expected during channel opening,
              will be accurate after channel is open!
            </Text>
          )}
      </View>
    );
  };

  render() {
    return (
      <View style={shared.container}>
        <Text style={shared.accountHeader}>
          Savings account{" "}
          <Text style={shared.smallerHeader}>(funds on blockchain)</Text>
        </Text>

        {this._renderBalances()}
        <View style={shared.separator} />
        <Button
          style={[shared.inCardButton]}
          onPress={async () => {
            try {
              const newaddress = await this.props.lndApi.newaddress();
              this.setState({
                generatedAddress: newaddress["address"],
                showingGeneratedAddress: !this.state.showingGeneratedAddress
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

            <Text>Faucet for receiving testnet coins:</Text>
            <Button
              style={[shared.smallButton]}
              onPress={() => {
                Linking.openURL("https://testnet.coinfaucet.eu/en/");
              }}
            >
              https://testnet.coinfaucet.eu/en/
            </Button>

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
        <Button
          style={[shared.inCardButton]}
          onPress={async () => {
            this.setState({
              showingSending: !this.state.showingSending,
              destinationAddress: "",
              paymentSat: "",
              paymentTx: undefined,
              paymentError: undefined
            });
          }}
        >
          Send on blockchain
        </Button>
        {this.state.showingSending && (
          <View>
            <TextInput
              style={[shared.textInput]}
              underlineColorAndroid="transparent"
              placeholder="Destination address"
              value={this.state.destinationAddress}
              onChangeText={text => this.setState({ destinationAddress: text })}
            />
            <TextInput
              style={[shared.textInput]}
              underlineColorAndroid="transparent"
              placeholder="Amount (in satoshis)"
              value={this.state.paymentSat}
              keyboardType="numeric"
              onChangeText={text => this.setState({ paymentSat: text })}
            />

            <Button
              style={[shared.inCardButton]}
              disabled={this.state.sendingPayment}
              styleDisabled={shared.disabledButton}
              onPress={async () => {
                try {
                  this.setState({ sendingPayment: true });
                  const payment = await this.props.lndApi.sendTransactionBlockchain(
                    this.state.destinationAddress,
                    this.state.paymentSat
                  );
                  if (payment.txid) {
                    this.setState({ paymentTx: payment.txid });
                  } else if (
                    payment.error &&
                    payment.error.includes("already have transaction")
                  ) {
                    let paymentTx;
                    if (payment.error.startsWith("Transaction")) {
                      paymentTx = payment.error.split(" ").filter(String)[1];
                    }
                    this.setState({
                      paymentTx: paymentTx
                        ? paymentTx
                        : "Your payment should be sent!"
                    });
                  } else if (payment.error) {
                    this.setState({ paymentError: payment.error });
                  } else {
                    this.setState({ paymentError: "Couldn't send coins!" });
                  }
                } catch (e) {
                  this.setState({ paymentError: JSON.stringify(e) });
                }
                this.setState({ sendingPayment: false });
              }}
            >
              Send
            </Button>
            {this.state.paymentError && (
              <Text style={shared.errorText} selectable>
                {this.state.paymentError}
              </Text>
            )}
            {this.state.paymentTx && (
              <View>
                <Text style={shared.boldText}>Transaction id:</Text>
                <Text style={shared.selectableText} selectable>
                  {this.state.paymentTx}
                </Text>
              </View>
            )}
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
    this.props.walletListener.stopWatching();
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
          <ActivityIndicator color="white" />
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
          <ComponentWelcome />
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
