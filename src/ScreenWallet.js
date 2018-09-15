import React, { Component } from "react";
import ReactMixin from "react-mixin";
import {
  ActivityIndicator,
  Animated,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import Button from "react-native-button";
import { styles as theme } from "react-native-theme";
import TimerMixin from "react-timer-mixin";
import ComponentActionSheet from "./ComponentActionSheet";
import ComponentBlockchainAccount from "./ComponentBlockchainAccount";
import ComponentLightningAccount from "./ComponentLightningAccount";
import ComponentLogo from "./ComponentLogo.js";
import ScreenReceive from "./ScreenReceive";
import ScreenSend from "./ScreenSend";
import WalletShutdownBackground from "./WalletShutdownBackground.js";
import withLnd from "./withLnd.js";
import withTheme from "./withTheme.js";

let backgroundShutdown = <View />;
if (Platform.OS === "ios") {
  backgroundShutdown = <WalletShutdownBackground />;
}

class ScreenWallet extends Component {
  constructor(props) {
    super(props);
    this.state = {
      wallet: undefined,
      getinfo: undefined,
      working: false,
      showAnim: new Animated.Value(0)
    };
  }

  componentDidMount() {
    this.setRunningWallet();
    this.props.walletListener.startWatching();
    this.getInfoListener_ = this.props.walletListener.listenToGetInfo(
      getinfo => {
        this.setState({ getinfo });
      }
    );
    this.animateShowAnim(1);
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

  animateShowAnim = (toValue, callback) => {
    Animated.spring(this.state.showAnim, {
      toValue,
      useNativeDriver: true,
      friction: 10,
      tension: 20
    }).start(callback);
  };

  _renderSend = () => {
    const closeModal = () => this.setState({ showingSend: false });
    return (
      <ComponentActionSheet
        visible={!!this.state.showingSend}
        onRequestClose={closeModal}
        animationType="slide"
        buttonText="Done"
        title="Send"
      >
        <ScreenSend />
      </ComponentActionSheet>
    );
  };

  _renderReceive = () => {
    const closeModal = () => this.setState({ showingReceive: false });
    return (
      <ComponentActionSheet
        visible={!!this.state.showingReceive}
        onRequestClose={closeModal}
        animationType="slide"
        buttonText="Done"
        title="Receive"
      >
        <ScreenReceive />
      </ComponentActionSheet>
    );
  };

  _renderSendReceive = () => {
    return (
      <View>
        {this._renderSend()}
        {this._renderReceive()}
        <Animated.View
          style={[
            styles.sendReceiveContainer,
            {
              opacity: this.state.showAnim,
              transform: [
                {
                  translateY: this.state.showAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [100, 0]
                  })
                }
              ]
            }
          ]}
        >
          <TouchableOpacity
            onPress={() => this.setState({ showingSend: true })}
            style={[
              theme.sendButton,
              styles.actionButtonContainer,
              styles.sendButton
            ]}
          >
            <View>
              <Text style={styles.actionText}>Send</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => this.setState({ showingReceive: true })}
            style={[
              theme.receiveButton,
              styles.actionButtonContainer,
              styles.receiveButton
            ]}
          >
            <View>
              <Text style={styles.actionText}>Receive</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  };

  _navigate = (screen, params) => {
    this.animateShowAnim(0, () =>
      this.props.navigation.navigate(screen, params)
    );
  };

  render() {
    let content;

    let footer = (
      <View>
        <Button
          style={[styles.closeWalletButton]}
          containerStyle={theme.container}
          onPress={async () => {
            this.setState({ working: true }, async () => {
              await this.props.stopLndFromWallet(this.state.wallet);
              if (Platform.OS == "ios") {
                // because lnd process isn't isolated on ios, after "closing"
                // the wallet, there is still lnd process related things
                // lingering in the background. For now, when the wallet
                // is closed, just display a wallet closed screen and the user
                // can click home button which will close the app and shut it
                // down completely and they can reopen another wallet by reopening
                // the app, less than ideal, should be fixed.
                this.setState({ iosWalletClosed: true });
                return;
              }
              this.props.navigation.navigate("Intro");
            });
          }}
        >
          Close wallet
        </Button>
      </View>
    );

    if (this.state.iosWalletClosed) {
      content = (
        <View style={theme.container}>
          <Text style={theme.accountHeader}>Wallet closed!</Text>
        </View>
      );
    } else if (
      !this.state.wallet ||
      !this.state.getinfo ||
      this.state.working
    ) {
      content = (
        <View>
          <ActivityIndicator color={this.props.spinnerOnBackgroundColor} />
        </View>
      );
    } else {
      // TODO: add welcome and feedback components back.
      // <ComponentWelcome />
      // <ComponentAskFeedback />
      content = (
        <View style={styles.container}>
          <View style={styles.container}>
            <ComponentLightningAccount
              showAnim={this.state.showAnim}
              navigate={this._navigate}
            />
          </View>
          <ComponentBlockchainAccount showAnim={this.state.showAnim} />
          {footer}
          {this._renderSendReceive()}
        </View>
      );
    }

    return (
      <View style={[styles.container, theme.appBackground]}>
        {backgroundShutdown}
        <Animated.View
          style={{
            flex: 0,
            transform: [
              {
                translateY: this.state.showAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-200, 0]
                })
              }
            ]
          }}
        >
          <ComponentLogo
            noSlogan={true}
            imageStyles={theme.logoOnLightBackground}
            useSmallLogo={true}
            showSettings={true}
          />
        </Animated.View>
        <View style={styles.restContainer}>{content}</View>
      </View>
    );
  }
}
ReactMixin(ScreenWallet.prototype, TimerMixin);
export default withTheme(withLnd(ScreenWallet));

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  logoContainer: {
    flex: 1
  },
  restContainer: {
    flex: 8
  },
  closeWalletButton: {
    color: "red"
  },
  sendReceiveContainer: {
    flexDirection: "row"
  },
  actionButtonContainer: {
    padding: 10,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10
  },
  actionText: {
    fontSize: 22,
    fontWeight: "700",
    color: "white"
  },
  receiveButton: {
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    marginRight: 10
  },
  sendButton: {
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    marginLeft: 10
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

const syncingStyles = StyleSheet.create({
  syncedText: {
    color: "green"
  },
  unsynced: {
    color: "orange"
  },
  container: {
    marginTop: 0
  }
});
