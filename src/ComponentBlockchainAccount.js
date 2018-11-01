import React, { Component } from "react";
import { Animated, Image, StyleSheet, Text, View } from "react-native";
import Button from "react-native-button";
import { styles as theme } from "react-native-theme";
import ComponentActionSheet from "./ComponentActionSheet";
import ScreenCreateChannel from "./ScreenCreateChannel.js";
import withLnd from "./withLnd.js";

class BlockchainAccount extends Component {
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
        <Text style={theme.baseText}>
          <Text style={theme.infoLabel}>Balance </Text>
          <Text style={theme.infoValue}>
            {this.props.displaySatoshi(
              (this.state.balance && this.state.balance.confirmed_balance) ||
                "0"
            )}
            {unconfirmed > 0 && (
              <Text>
                {" "}
                (unconfirmed: {this.props.displaySatoshi(unconfirmed)})
              </Text>
            )}
          </Text>
        </Text>
        {this.state.pendingChannel &&
          this.state.pendingChannel.pending_open_channels &&
          this.state.pendingChannel.pending_open_channels.length > 0 && (
            <Text style={theme.warningText}>
              Your balance could be lower than expected during channel opening,
              will be accurate after channel is open!
            </Text>
          )}
      </View>
    );
  };

  _renderTransfer = () => {
    const closeModal = () => this.setState({ showingTransfer: false });
    return (
      <ComponentActionSheet
        visible={!!this.state.showingTransfer}
        onRequestClose={closeModal}
        animationType="slide"
        buttonText="Done"
        title="New channel"
      >
        <ScreenCreateChannel onCancel={closeModal} />
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
            source={require("../assets/blockchain.png")}
            style={styles.headerIcon}
          />
          <Text style={theme.accountHeader}>Blockchain account</Text>
        </View>

        <View style={styles.container}>{this._renderBalances()}</View>

        <View style={theme.bottomActionContainer}>
          <Button
            containerStyle={theme.cardBottomActionButton}
            style={theme.smallActionButtonText}
            onPress={() => {
              this.setState({
                showingTransfer: true
              });
            }}
          >
            new channel
          </Button>
        </View>

        {this._renderTransfer()}
      </Animated.View>
    );
  }
}

export default withLnd(BlockchainAccount);

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
  }
});
