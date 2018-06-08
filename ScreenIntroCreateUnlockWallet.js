import React, { Component } from "react";

import {
  ActivityIndicator,
  AsyncStorage,
  Image,
  LayoutAnimation,
  Linking,
  StyleSheet,
  ScrollView,
  Text,
  TouchableWithoutFeedback,
  ToastAndroid,
  View,
  TextInput,
  Platform
} from "react-native";
import { LOGO_COLOR } from "./Colors.js";
import Button from "react-native-button";
import CheckBox from "react-native-check-box";
import RadioForm, {
  RadioButton,
  RadioButtonInput,
  RadioButtonLabel
} from "react-native-simple-radio-button";
import { styles as theme } from "react-native-theme";

import LndConsumer from "./ContextLnd.js";
import { withLnd } from "./withLnd.js";
import withTheme from "./withTheme";

class ExpandableButton extends Component {
  constructor(props) {
    super(props);
    this.state = {
      expanded: false
    };
  }

  componentWillReceiveProps(nextProps) {
    if (!this.state.expanded && nextProps.expanded) {
      LayoutAnimation.easeInEaseOut();
      this.setState({ expanded: true });
    }
  }

  render() {
    return (
      <View style={[buttonStyles.container, this.props.style]}>
        <TouchableWithoutFeedback
          onPress={() => {
            LayoutAnimation.easeInEaseOut();
            this.setState({ expanded: !this.state.expanded });
          }}
        >
          <View>
            <Text style={buttonStyles.actionText}>{this.props.text}</Text>
          </View>
        </TouchableWithoutFeedback>
        {this.state.expanded && this.props.children}
      </View>
    );
  }
}

class QuickCreateWallet extends Component {
  constructor(props) {
    super(props);
    this.state = { creating: false, noWallets: false };
  }
  render() {
    if (
      !this.state.noWallets &&
      (!this.props.wallets || this.props.wallets.length != 0)
    ) {
      return <View />;
    }
    const createWallet = async () => {
      this.setState(
        { creating: true, error: "", noWallets: true },
        async () => {
          try {
            const defaultWallet = {
              name: "default",
              coin: "bitcoin",
              network: "testnet",
              mode: "neutrino",
              neutrinoConnect: "rbtcd-t-g.rawtx.com",
              usesKeychain: true
            };
            // Add wallet to wallet.conf and start lnd.
            const newWallet = await this.props.addWallet(defaultWallet);
            await this.props.startLndFromWallet(newWallet);

            // Generate seed.
            const seed = await this.props.lndApi.genSeed();
            let seedCipher;
            if (seed.cipher_seed_mnemonic) {
              seedCipher = seed.cipher_seed_mnemonic;
            } else {
              this.setState({
                error: "There was a problem getting the seed!"
              });
              return;
            }

            // Set the password.
            const response = await this.props.lndApi.initwallet(
              seedCipher,
              "12345678"
            );
            if (response.error) {
              this.setState({ error: response.error });
              return;
            }
            await this.props.walletKeychain.setWalletPassword(
              newWallet.ix,
              "12345678"
            );
            this.setState({ success: true, creating: false });
          } catch (error) {
            this.setState({ error: error.toString(), creating: false });
          }
        }
      );
    };
    return (
      <View style={[buttonStyles.container, this.props.style]}>
        <TouchableWithoutFeedback
          onPress={() => {
            if (this.state.creating) return;
            createWallet();
          }}
        >
          <View>
            <Text style={[buttonStyles.actionText, buttonStyles.quickText]}>
              Quick start with a default wallet
            </Text>
            {!!this.state.creating && (
              <View style={unlockWalletStyles.contentContainer}>
                <ActivityIndicator color={LOGO_COLOR} />
              </View>
            )}
            {!!this.state.error && (
              <View style={unlockWalletStyles.contentContainer}>
                <Text style={theme.errorText}>Error: {this.state.error}</Text>
              </View>
            )}
            {!!this.state.success && (
              <View style={unlockWalletStyles.contentContainer}>
                <Text>
                  Successfully created testnet Bitcoin wallet with password
                  12345678.
                </Text>
                <Button
                  style={createWalletStyles.buttonText}
                  onPress={() => {
                    this.props.navigate("Wallet");
                  }}
                >
                  Go to wallet
                </Button>
              </View>
            )}
          </View>
        </TouchableWithoutFeedback>
      </View>
    );
  }
}

const QuickCreateWalletWithLnd = withLnd(QuickCreateWallet);

class UnlockWallet extends Component {
  constructor(props) {
    super(props);
    this.state = {
      unlocking: undefined,
      working: false,
      error: "",
      withRememberedPassword: false
    };
  }

  componentWillReceiveProps(nextProps) {
    if (!this.state.unlocking && nextProps.unlockingWallet) {
      this.setState({
        unlocking: nextProps.unlockingWallet,
        withRememberedPassword: nextProps.unlockWallet.usesKeychain
      });
    }
  }

  render() {
    const { wallets } = this.props;
    let content;
    if (wallets == undefined || (wallets && wallets.length <= 0)) {
      content = (
        <View>
          <Text style={unlockWalletStyles.noWalletText}>
            You haven't created any wallets yet.
          </Text>
        </View>
      );
    } else if (!this.state.unlocking && wallets && wallets.length > 0) {
      content = (
        <View>
          <Text style={unlockWalletStyles.noWalletText}>
            Select wallet to unlock:
          </Text>

          {this.props.wallets.map((w, i) => {
            return (
              <View key={i} style={unlockWalletStyles.buttonActivityContainer}>
                <Button
                  containerStyle={unlockWalletStyles.buttonContainer}
                  style={unlockWalletStyles.button}
                  disabled={this.state.working}
                  styleDisabled={unlockWalletStyles.disabledStyle}
                  onPress={async () => {
                    LayoutAnimation.easeInEaseOut();
                    this.setState(
                      { animatingIx: i, working: true },
                      async () => {
                        const navigating = await this.props.unlockWallet(w);
                        if (navigating == "alreadyRunning") {
                          this.setState({
                            animatingIx: undefined,
                            working: false
                          });
                          return;
                        } else if (navigating) {
                          return;
                        }
                        this.setState({
                          unlocking: w,
                          working: false,
                          withRememberedPassword: w.usesKeychain
                        });
                      }
                    );
                  }}
                >
                  {w.name}
                </Button>
                {this.state.animatingIx == i && (
                  <ActivityIndicator color={LOGO_COLOR} size="small" />
                )}
              </View>
            );
          })}
        </View>
      );
    } else if (this.state.unlocking && this.state.withRememberedPassword) {
      // Make sure the wallet does indeed use keychains and that we didn't
      // end up in this state by mistake.
      if (!this.state.unlocking.usesKeychain) {
        this.setState({ withRememberedPassword: false });
        content = <View />;
      } else {
        const getPassword = async () => {
          const password = await this.props.walletKeychain.getWalletPassword(
            this.state.unlocking.ix
          );
          if (password == "") {
            this.setState({
              withRememberedPassword: false,
              error: "Couldn't retrieve remembered password!"
            });
          } else {
            const unlockResult = await this.props.unlockwallet(password);
            if (unlockResult.error) {
              this.setState({
                withRememberedPassword: false,
                error: unlockResult.error
              });
            } else {
              this.props.navigate("Wallet");
            }
          }
        };
        getPassword();
      }
      content = (
        <View>
          <ActivityIndicator />
          <Text>Unlocking with remembered password!</Text>
        </View>
      );
    } else if (this.state.unlocking) {
      const showKeychainOpt =
        !this.state.unlocking.usesKeychain &&
        this.props.walletKeychain &&
        this.props.walletKeychain.isKeychainEnabled();
      content = (
        <View>
          <TextInput
            style={createWalletStyles.nameInput}
            underlineColorAndroid="transparent"
            placeholder="Password"
            secureTextEntry={true}
            value={this.state.password}
            onChangeText={text => this.setState({ password: text })}
          />
          {showKeychainOpt && (
            <CheckBox
              style={{ flex: 1, padding: 10 }}
              onClick={() =>
                this.setState({ useKeychain: !this.state.useKeychain })
              }
              isChecked={this.state.useKeychain}
              rightText="Remember password"
              checkBoxColor={LOGO_COLOR}
            />
          )}
          <View style={unlockWalletStyles.actionContainer}>
            <Button
              style={[
                unlockWalletStyles.button,
                unlockWalletStyles.cancelButton
              ]}
              disabled={this.state.working}
              styleDisabled={unlockWalletStyles.disabledStyle}
              onPress={async () => {
                LayoutAnimation.easeInEaseOut();
                await this.props.stopLndFromWallet(this.state.unlocking);
                this.setState({
                  unlocking: undefined,
                  animatingIx: undefined,
                  password: "",
                  error: "",
                  working: false,
                  useKeychain: false,
                  withRememberedPassword: false
                });
              }}
            >
              Cancel
            </Button>

            <Button
              style={unlockWalletStyles.button}
              disabled={this.state.working}
              styleDisabled={unlockWalletStyles.disabledStyle}
              onPress={async () => {
                if (!this.state.password || this.state.password == "") {
                  this.setState({ error: "Empty password!" });
                  return;
                }
                this.setState({ working: true, error: "" }, async () => {
                  const unlockResult = await this.props.unlockwallet(
                    this.state.password
                  );
                  this.setState({ working: false });
                  if (unlockResult.error) {
                    this.setState({ error: unlockResult.error });
                    return;
                  }
                  if (this.state.useKeychain) {
                    this.state.unlocking.usesKeychain = true;
                    await this.props.updateWalletConf(this.state.unlocking);
                    await this.props.walletKeychain.setWalletPassword(
                      this.state.unlocking.ix,
                      this.state.password
                    );
                  }
                  this.props.navigate("Wallet");
                });
              }}
            >
              Unlock
            </Button>
          </View>
          {this.state.working && (
            <View>
              <ActivityIndicator color={LOGO_COLOR} size="small" />
            </View>
          )}
        </View>
      );
    }
    return (
      <ExpandableButton
        text="Unlock existing wallet"
        expanded={this.state.unlocking}
      >
        <View style={unlockWalletStyles.contentContainer}>
          {content}
          <View>
            <Text style={createWalletStyles.warningText}>
              {this.state.error}
            </Text>
          </View>
        </View>
      </ExpandableButton>
    );
  }
}

class CreateWallet extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: "default",
      coin: "bitcoin",
      network: "testnet",
      mode: "neutrino",
      neutrinoConnect: "rbtcd-t-g.rawtx.com",
      creating: false,
      error: ""
    };
  }
  render() {
    const addWallet = async () => {
      this.setState({ creating: true, error: "" }, async () => {
        try {
          const res = await this.props.addWallet(this.state);
          if (res == "alreadyRunning") {
            this.setState({
              creating: false,
              error: "A wallet is already running!"
            });
          }
        } catch (error) {
          this.setState({ error: error.toString(), creating: false });
        }
      });
    };
    return (
      <ExpandableButton text="Create new wallet">
        <View style={createWalletStyles.container}>
          <View>
            <Text style={createWalletStyles.subtitle}>Wallet name</Text>
            <TextInput
              style={createWalletStyles.nameInput}
              underlineColorAndroid="transparent"
              placeholder="Name for wallet"
              defaultValue="default"
              value={this.state.name}
              onChangeText={text => this.setState({ name: text })}
            />
          </View>
          <View>
            <Text style={createWalletStyles.subtitle}>Cryptocurrency</Text>
            <RadioForm
              radio_props={[{ label: "Bitcoin", value: "bitcoin" }]}
              initial={0}
              animation={false}
              formHorizontal={true}
              onPress={val => this.setState({ coin: val })}
            />
          </View>
          <View>
            <Text style={createWalletStyles.subtitle}>Network</Text>
            <RadioForm
              radio_props={
                this.props.recklessMode
                  ? [
                      { label: "Testnet    ", value: "testnet" },
                      { label: "Mainnet", value: "mainnet" }
                    ]
                  : [{ label: "Testnet    ", value: "testnet" }]
              }
              initial={0}
              animation={false}
              formHorizontal={true}
              onPress={val => {
                if (val == "mainnet") {
                  this.setState({ neutrinoConnect: "btcd-m-g.rawtx.com" });
                } else {
                  this.setState({ neutrinoConnect: "rbtcd-t-g.rawtx.com" });
                }
                this.setState({ network: val });
              }}
            />
          </View>
          <View>
            <Text style={createWalletStyles.subtitle}>Operation mode</Text>
            <RadioForm
              ref="networkModeRadio"
              animation={false}
              radio_props={[{ label: "Neutrino", value: "neutrino" }]}
              initial={0}
              formHorizontal={true}
              onPress={val => {
                this.setState({ mode: val });
              }}
            />
            {this.state.mode == "btcd" && (
              <Text style={createWalletStyles.warningText}>
                Full btcd mode will take longer to sync and take bigger disk
                space.
              </Text>
            )}
          </View>
          {this.state.mode == "neutrino" && (
            <View>
              <Text style={createWalletStyles.subtitle}>
                Neutrino peers to add
              </Text>
              <TextInput
                style={createWalletStyles.nameInput}
                underlineColorAndroid="transparent"
                placeholder="Neutrino server"
                defaultValue="faucet.lightning.community"
                value={this.state.neutrinoConnect}
                onChangeText={text => this.setState({ neutrinoConnect: text })}
              />
              <Text style={theme.warningText}>
                Adding extra known peers will help you sync faster. You can add
                more peers separated by a comma(,).
              </Text>
            </View>
          )}
          <Button
            style={createWalletStyles.buttonText}
            onPress={addWallet}
            disabled={this.state.creating}
          >
            Create wallet
          </Button>
          {this.state.creating && <ActivityIndicator />}
          {this.state.error != "" && (
            <Text style={createWalletStyles.warningText}>
              {this.state.error}
            </Text>
          )}
        </View>
      </ExpandableButton>
    );
  }
}

class ScreenIntroCreateUnlockWallet extends Component {
  constructor(props) {
    super(props);
    this.state = {
      unlockingWallet: undefined,
      recklessCounter: 0,
      recklessMode: false
    };
  }

  componentDidMount() {
    this.checkStateAndNavigate();
    this.checkReckless();
  }

  checkReckless = async () => {
    try {
      const recklessMode = await AsyncStorage.getItem("@rawtxapp:recklessMode");
      if (recklessMode == "on") {
        this.setState({ recklessMode: true });
      }
    } catch (err) {}
  };

  // will return true if navigating.
  checkStateAndNavigate = async () => {
    console.log("Checking state and navigating");
    const lndRunning = await this.props.isLndProcessRunning();
    if (!lndRunning) {
      // nothing to do
      Linking.getInitialURL().then(url => {
        if (
          url &&
          url.startsWith("lightning:") &&
          !this.props.isInitialInvoiceHandled()
        ) {
          ToastAndroid.show(
            "Your wallet isn't running, open you wallet to pay the invoice!",
            ToastAndroid.LONG
          );
        }
      });
      return;
    }

    const runningWallet = await this.props.getRunningWallet();
    if (!runningWallet) {
      return;
    }
    this.setState({ runningWallet });

    // check if we are at genseed stage
    try {
      console.log("Looking for GenSeed");
      const seed = await this.props.genSeed();
      if (seed.cipher_seed_mnemonic) {
        console.log("Found GenSeed, navigating to it");
        this.props.navigation.navigate("GenSeed", { seedResponse: seed });
        this.setState({ foundState: true });
        return true;
      } else if (seed.error == "wallet already exists") {
        console.log("Wallet already created, asking for password");
        this.setState({ unlockingWallet: runningWallet, foundState: true });
        return false;
      }
    } catch (err) {
      console.log("past the walletunlocker stage ?");
      console.log(err);
    }

    try {
      console.log("Looking for getinfo");
      const getinfo = await this.props.lndApi.getInfo();
      if (getinfo.identity_pubkey) {
        console.log("Found GetInfo, navigating to Wallet");
        this.props.navigation.navigate("Wallet");
        return true;
      }
    } catch (err) {
      console.log(err);
    }

    console.log("Couldn't determine wallet state, shutting down LND!");
    await this.props.stopLndFromWallet(runningWallet);
    this.setState({ runningWallet: undefined });
  };

  render() {
    return (
      <ScrollView style={[styles.container, this.props.theme.appBackground]}>
        <View style={styles.logoContainer}>
          <TouchableWithoutFeedback
            onPress={() => {
              if (Platform.OS == "ios") {
                // No reckless mode on iOS for now :(
                return;
              }
              if (this.state.recklessCounter == 10) {
                ToastAndroid.show("#RECKLESS", ToastAndroid.LONG);
                try {
                  AsyncStorage.setItem("@rawtxapp:recklessMode", "on");
                } catch (err) {}
                this.setState({ recklessMode: true });
                return;
              }
              this.setState({
                recklessCounter: this.state.recklessCounter + 1
              });
            }}
          >
            <View style={styles.simpleContainer}>
              <Image
                source={require("./assets/intro-logo.png")}
                style={{
                  width: undefined,
                  height: 150,
                  flex: 1,
                  resizeMode: "contain",
                  tintColor: this.props.logoOnBackgroundColor
                }}
              />
            </View>
          </TouchableWithoutFeedback>
          <View style={styles.simpleContainer}>
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit={true}
              style={[styles.slogan, this.props.theme.textOnBackground]}
            >
              lightning network wallet
            </Text>
          </View>
        </View>
        <LndConsumer>
          {({ addWallet, wallets }) => (
            <View style={styles.actionContainer}>
              <View style={styles.buttonContainer}>
                <QuickCreateWalletWithLnd
                  navigate={this.props.navigation.navigate}
                />
              </View>
              <View style={styles.buttonContainer}>
                <UnlockWallet
                  wallets={wallets}
                  unlockingWallet={this.state.unlockingWallet}
                  navigate={this.props.navigation.navigate}
                  unlockwallet={this.props.lndApi.unlockwallet}
                  stopLndFromWallet={this.props.stopLndFromWallet}
                  walletKeychain={this.props.walletKeychain}
                  updateWalletConf={this.props.updateWalletConf}
                  unlockWallet={async w => {
                    const running = await this.props.getRunningWallet();
                    if (running) {
                      ToastAndroid.show(
                        "A wallet is already running in the background, if the app hangs, please kill the server and try to start again!",
                        ToastAndroid.LONG
                      );
                      return "alreadyRunning";
                    }
                    await this.props.startLndFromWallet(w);
                    return await this.checkStateAndNavigate();
                  }}
                />
              </View>
              <View style={styles.buttonContainer}>
                <CreateWallet
                  recklessMode={this.state.recklessMode}
                  addWallet={async newWallet => {
                    const running = await this.props.getRunningWallet();
                    if (running) {
                      ToastAndroid.show(
                        "A wallet is already running in the background, if the app hangs, please kill the server and try to start again!",
                        ToastAndroid.LONG
                      );
                      return "alreadyRunning";
                    }
                    newWallet = await addWallet(newWallet);
                    await this.props.startLndFromWallet(newWallet);
                    this.props.navigation.navigate("GenSeed", {
                      wallet: newWallet
                    });
                  }}
                />
              </View>
            </View>
          )}
        </LndConsumer>
        {this.state.runningWallet &&
          !this.state.foundState && (
            <Button
              style={[buttonStyles.container, styles.killButton]}
              onPress={async () => {
                this.setState({ killing: true });
                try {
                  await this.props.stopLndFromWallet(this.state.runningWallet);
                } catch (e) {}
                this.setState({ runningWallet: undefined, killing: false });
              }}
            >
              Determining LND state, if it hangs, click here to kill it and
              reopen wallet!{" "}
              {this.state.killing &&
                "(killing, if this hangs, you can kill from Android settings!)"}
            </Button>
          )}
      </ScrollView>
    );
  }
}

export default withTheme(withLnd(ScreenIntroCreateUnlockWallet));

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  simpleContainer: {
    flex: 1
  },
  logoContainer: {
    flex: 3,
    padding: 50,
    paddingTop: 20
  },
  actionContainer: {
    flex: 8
  },
  slogan: {
    alignSelf: "center",
    flex: 1,
    fontSize: 16
  },
  nWallets: {
    fontSize: 22,
    color: "white"
  },
  buttonContainer: {
    flex: 1
  },
  killButton: {
    padding: 20,
    color: "red",
    marginTop: 40
  }
});

const buttonStyles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    borderRadius: 10,
    margin: 10,
    width: "90%",
    alignSelf: "center",
    elevation: 1,
    shadowOpacity: 0.0015 + 0.18,
    shadowRadius: 0.54,
    shadowOffset: {
      height: 0.6
    }
  },
  actionText: {
    fontSize: 16,
    color: "black",
    padding: 20
  },
  quickText: {
    color: "green",
    fontWeight: "bold"
  }
});

const unlockWalletStyles = StyleSheet.create({
  noWalletText: {
    fontSize: 16,
    color: "black"
  },
  contentContainer: {
    padding: 20,
    paddingTop: 0
  },
  buttonContainer: {
    flex: 5
  },
  buttonActivityContainer: {
    flexDirection: "row",
    flex: 1
  },
  button: {
    margin: 5,
    color: LOGO_COLOR,
    borderWidth: 2,
    borderColor: LOGO_COLOR,
    margin: 10,
    padding: 10,
    borderRadius: 10,
    flex: 1
  },
  actionContainer: {
    flexDirection: "row",
    justifyContent: "flex-end"
  },
  cancelButton: {
    color: "red"
  },
  disabledStyle: {
    borderColor: "gray",
    color: "gray"
  }
});

const createWalletStyles = StyleSheet.create({
  nameInput: {
    height: 50,
    borderColor: LOGO_COLOR,
    borderWidth: 2,
    borderRadius: 10,
    marginBottom: 10
  },
  container: {
    padding: 20,
    paddingTop: 0
  },
  radioText: {
    fontSize: 16,
    marginBottom: 10
  },
  subtitle: {
    marginBottom: 5
  },
  warningText: {
    fontSize: 12,
    color: "red"
  },
  buttonText: {
    color: LOGO_COLOR,
    padding: 10
  }
});
