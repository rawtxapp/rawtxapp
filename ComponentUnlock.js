/* @flow */
import React, { Component } from "react";
import {
  ActivityIndicator,
  LayoutAnimation,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import Button from "react-native-button";
import { withNavigation } from "react-navigation";
import { convertErrorToStr } from "./Utils.js";
import { styles as theme } from "react-native-theme";
import withLnd from "./withLnd.js";

import type { LndApi, LNDState } from "./RestLnd";

type Props = {
  wallets: Object[],
  startLndFromWallet: Object => void,
  lndApi: LndApi,
  getRunningWallet: void => Object,
  walletKeychain: Object,
  navigation: Object
};
type State = {
  working: ?boolean,
  error: ?string,
  unlocking: ?Object,
  initialLndState: LNDState
};
class ComponentUnlock extends Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      working: false,
      error: undefined,
      lndState: "unknown",
      unlocking: undefined,
      initialLndState: "unknown"
    };
  }

  componentDidMount() {
    this.checkLndState();
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      this.state.unlocking &&
      this.state.unlocking.usesKeychain &&
      (!prevState.unlocking || !prevState.usesKeychain)
    ) {
      this.unlockWithKeychain();
    }
  }

  unlockWithKeychain = async () => {
    if (!this.state.unlocking) return;
    const password = await this.props.walletKeychain.getWalletPassword(
      this.state.unlocking.ix
    );
    if (password == "") {
      this.setState({
        error: "Couldn't retrieve remembered password!"
      });
    } else {
      const unlockResult = await this.props.lndApi.unlockwallet(password);
      if (unlockResult.error) {
        this.setState({
          error: convertErrorToStr(unlockResult.error)
        });
      } else {
        this.props.navigation.navigate("Wallet");
      }
    }
  };

  checkLndState = async () => {
    try {
      const running = await this.props.getRunningWallet();
      if (running) {
        const lndState = await this.props.lndApi.determineState();
        this.updateWithState(lndState, running);
      }
    } catch (err) {}
  };

  updateWithState = (lndState: LNDState, runningWallet: Object) => {
    if (lndState == "password") {
      this.setState({ unlocking: runningWallet });
    }
  };

  _renderWalletChoose = () => {
    if (this.state.unlocking || this.state.working) return;
    return (
      <View>
        <Text style={styles.text}>Select wallet to unlock:</Text>

        {this.props.wallets.map((w, i) => {
          return (
            <View key={i}>
              <Button
                style={styles.button}
                onPress={async () => {
                  LayoutAnimation.easeInEaseOut();
                  this.setState({ working: true }, async () => {
                    try {
                      await this.props.startLndFromWallet(w);
                    } catch (err) {
                      this.setState({
                        error: convertErrorToStr(err),
                        working: false
                      });
                      return;
                    }

                    let lndState: LNDState = "unknown";
                    try {
                      for (let i = 0; i < 10 && lndState == "unknown"; i++) {
                        lndState = await this.props.lndApi.determineState();
                      }
                      if (lndState == "unknown") {
                        this.setState({
                          error: "couldn't determine lnd state"
                        });
                      } else if (lndState == "password") {
                        this.setState({ unlocking: w });
                      } else if (lndState == "seed") {
                        this.props.navigation.navigate("GenSeed");
                        return;
                      } else {
                        // TODO: handle unlocked
                      }
                    } catch (err) {
                      this.setState({
                        error: convertErrorToStr(err),
                        working: false
                      });
                    }
                    this.setState({ working: false });
                  });
                }}
              >
                {w.name}
              </Button>
            </View>
          );
        })}
      </View>
    );
  };

  _renderUnlockingWithKeychain = () => {
    return (
      <View style={styles.unlockingContainer}>
        <ActivityIndicator color="white" />
        <Text style={styles.text}>Unlocking with remembered password!</Text>
      </View>
    );
  };

  _renderUnlocking = () => {
    if (!this.state.unlocking || this.state.working) return;
    if (this.state.unlocking.usesKeychain) {
      return this._renderUnlockingWithKeychain();
    }
    return (
      <View>
        <Text>{JSON.stringify(this.state.unlocking)}</Text>
      </View>
    );
  };

  render() {
    return (
      <ScrollView style={[styles.contentContainer]}>
        {this._renderWalletChoose()}
        {this._renderUnlocking()}
        {this.state.working && <ActivityIndicator color="white" />}
        <View style={{ height: 20 }} />
      </ScrollView>
    );
  }
}

export default withNavigation(withLnd(ComponentUnlock));

const styles = StyleSheet.create({
  contentContainer: {
    padding: 20,
    paddingVertical: 10,
    backgroundColor: "rgba(0, 0, 0, 0.3)"
  },
  text: {
    color: "white"
  },
  button: {
    margin: 5,
    color: "#0277BD",
    margin: 10,
    padding: 10,
    marginVertical: 5,
    borderRadius: 10,
    backgroundColor: "#ECEFF1",
    fontWeight: "300",
    overflow: "hidden"
  },
  unlockingContainer: {
    alignItems: "center"
  }
});
