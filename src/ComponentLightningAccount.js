import React, { Component } from "react";
import { Animated, Image, StyleSheet, Text, View } from "react-native";
import Button from "react-native-button";
import { styles as theme } from "react-native-theme";
import ComponentActionSheet from "./ComponentActionSheet";
import ComponentLappsInCard from "./ComponentLappsInCard";
import ComponentReceiveFaucet from "./ComponentReceiveFaucet.js";
import ScreenChannels from "./ScreenChannels.js";
import ScreenTransactions from "./ScreenTransactions.js";
import withLnd from "./withLnd.js";

class LightningAccount extends Component {
  constructor(props) {
    super(props);
    this.state = {};
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
          <Text style={[theme.infoLabel]}>Channels </Text>
          <Text style={theme.infoValue}>{active}</Text>
          {hasPending && (
            <Text style={theme.infoValue}>
              {" "}
              (
              {inactive > 0
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
        <Text style={theme.baseText}>
          <Text style={[theme.infoLabel]}>Balance </Text>
          <Text style={theme.infoValue}>
            {this.props.displaySatoshi(
              (this.state.balance && this.state.balance.balance) || "0"
            )}
            {hasOpenLimbo && (
              <Text>
                {" "}
                (
                {hasOpen
                  ? "pending: +" +
                    this.props.displaySatoshi(pendingOpen) +
                    (hasLimbo ? ", " : "")
                  : ""}
                {hasLimbo ? "limbo: " + this.props.displaySatoshi(limbo) : ""})
              </Text>
            )}
          </Text>
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
        visible={!!this.state.showingPayments}
        onRequestClose={closeModal}
        animationType="slide"
        buttonText="Done"
        title="Payments"
      >
        <ScreenTransactions onCancel={closeModal} />
      </ComponentActionSheet>
    );
  };

  _renderChannels = () => {
    const closeModal = () => this.setState({ showingChannels: false });
    return (
      <ComponentActionSheet
        visible={!!this.state.showingChannels}
        onRequestClose={closeModal}
        animationType="slide"
        buttonText="Done"
        title="Channels"
      >
        <ScreenChannels onCancel={closeModal} />
      </ComponentActionSheet>
    );
  };

  render() {
    return (
      <Animated.View
        style={[
          theme.container,
          styles.container,
          {
            opacity: this.props.showAnim,
            transform: [
              {
                translateY: this.props.showAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [800, 0]
                })
              }
            ]
          }
        ]}
      >
        <View style={styles.headerTitleContainer}>
          <Image
            source={require("../assets/lightning.png")}
            style={styles.headerIcon}
          />
          <Text style={theme.accountHeader}>Lightning account</Text>
        </View>
        <View style={styles.container}>
          {this._renderBalances()}
          {this._renderChannelCount()}
        </View>
        <ComponentLappsInCard navigate={this.props.navigate} />
        <View style={styles.bottomActionContainer}>
          <Button
            containerStyle={[
              theme.cardBottomActionButton,
              styles.leftBottomAction
            ]}
            style={theme.smallActionButtonText}
            onPress={() => {
              this.setState({
                showingPayments: true
              });
            }}
          >
            Transactions
          </Button>
          <Button
            containerStyle={[
              theme.cardBottomActionButton,
              styles.rightBottomAction
            ]}
            style={theme.smallActionButtonText}
            onPress={() => {
              this.setState({
                showingChannels: true
              });
            }}
          >
            Channels
          </Button>
        </View>
        {this._renderShowPayments()}
        {this._renderChannels()}
      </Animated.View>
    );
  }
}

export default withLnd(LightningAccount);

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  headerTitleContainer: {
    flexDirection: "row",
    alignItems: "center"
  },
  headerIcon: {
    width: 20,
    height: 20,
    marginRight: 5
  },
  bottomActionContainer: {
    flexDirection: "row",
    marginTop: 10
  },
  leftBottomAction: {
    marginRight: 0,
    borderRightWidth: 1
  },
  rightBottomAction: {
    marginLeft: 0
  }
});
