import React, { Component } from 'react';

import {
  ActivityIndicator,
  Image,
  LayoutAnimation,
  StyleSheet,
  ScrollView,
  Text,
  TouchableWithoutFeedback,
  View,
  TextInput,
  Platform,
} from 'react-native';
import { LOGO_COLOR } from './Colors.js';
import Button from 'react-native-button';
import RadioForm, {
  RadioButton,
  RadioButtonInput,
  RadioButtonLabel,
} from 'react-native-simple-radio-button';

import LndConsumer from './ContextLnd.js';
import { withLnd } from './withLnd.js';

class ExpandableButton extends Component {
  constructor(props) {
    super(props);
    this.state = {
      expanded: false,
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

class UnlockWallet extends Component {
  constructor(props) {
    super(props);
    this.state = {
      unlocking: undefined,
      working: false,
      error: '',
    };
  }

  componentWillReceiveProps(nextProps) {
    if (!this.state.unlocking && nextProps.unlockingWallet) {
      this.setState({ unlocking: nextProps.unlockingWallet });
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
                        if (navigating) {
                          return;
                        }
                        this.setState({ unlocking: w, working: false });
                      },
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
    } else if (this.state.unlocking) {
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
          <View style={unlockWalletStyles.actionContainer}>
            <Button
              style={[
                unlockWalletStyles.button,
                unlockWalletStyles.cancelButton,
              ]}
              disabled={this.state.working}
              styleDisabled={unlockWalletStyles.disabledStyle}
              onPress={async () => {
                LayoutAnimation.easeInEaseOut();
                await this.props.stopLndFromWallet(this.state.unlocking);
                this.setState({
                  unlocking: undefined,
                  animatingIx: undefined,
                  password: '',
                  error: '',
                  working: false,
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
                if (!this.state.password || this.state.password == '') {
                  this.setState({ error: 'Empty password!' });
                  return;
                }
                this.setState({ working: true, error: '' }, async () => {
                  const unlockResult = await this.props.unlockwallet(
                    this.state.password,
                  );
                  this.setState({ working: false });
                  if (unlockResult.error) {
                    this.setState({ error: unlockResult.error });
                    return;
                  }
                  console.log(unlockResult);
                  this.props.navigate('Wallet');
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
      name: 'default',
      coin: 'bitcoin',
      network: 'testnet',
      mode: 'neutrino',
      neutrinoConnect: 'faucet.lightning.community',
      creating: false,
      error: '',
    };
  }
  render() {
    const addWallet = async () => {
      this.setState({ creating: true, error: '' }, async () => {
        try {
          await this.props.addWallet(this.state);
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
              radio_props={[{ label: 'Bitcoin', value: 'bitcoin' }]}
              initial={0}
              animation={false}
              formHorizontal={true}
              onPress={val => this.setState({ coin: val })}
            />
          </View>
          <View>
            <Text style={createWalletStyles.subtitle}>Network</Text>
            <RadioForm
              radio_props={[
                { label: 'Testnet    ', value: 'testnet' },
                { label: 'Mainnet', value: 'mainnet' },
              ]}
              initial={0}
              animation={false}
              formHorizontal={true}
              onPress={val => {
                // TODO: this is super ugly, fix!
                if (val == 'mainnet') {
                  this.refs.networkModeRadio.updateIsActiveIndex(0);
                  this.setState({ mode: 'btcd' });
                } else {
                  this.refs.networkModeRadio.updateIsActiveIndex(0);
                  this.setState({ mode: 'neutrino' });
                }
                this.setState({ network: val });
              }}
            />
            {this.state.network == 'mainnet' && (
              <Text style={createWalletStyles.warningText}>
                Warning: while this app works with mainnet, it's still in beta
                phase. Assume that any money you use on mainnet could be lost
                and don't put more money than you can afford to lose.
              </Text>
            )}
          </View>
          <View>
            <Text style={createWalletStyles.subtitle}>Operation mode</Text>
            <RadioForm
              ref="networkModeRadio"
              animation={false}
              radio_props={
                this.state.network == 'mainnet'
                  ? [{ label: 'btcd-full', value: 'btcd' }]
                  : [
                      { label: 'neutrino    ', value: 'neutrino' },
                      { label: 'btcd-full', value: 'btcd' },
                    ]
              }
              initial={0}
              formHorizontal={true}
              onPress={val => {
                this.setState({ mode: val });
              }}
            />
            {this.state.network == 'mainnet' &&
              this.state.mode == 'neutrino' && (
                <Text style={createWalletStyles.warningText}>
                  Can't use neutrino with mainnet.{' '}
                </Text>
              )}
            {this.state.mode == 'btcd' && (
              <Text style={createWalletStyles.warningText}>
                Full btcd mode will take longer to sync and take bigger disk
                space.
              </Text>
            )}
          </View>
          {this.state.mode == 'neutrino' && (
            <View>
              <Text style={createWalletStyles.subtitle}>Neutrino server</Text>
              <TextInput
                style={createWalletStyles.nameInput}
                underlineColorAndroid="transparent"
                placeholder="Neutrino server"
                defaultValue="faucet.lightning.community"
                value={this.state.neutrinoConnect}
                onChangeText={text => this.setState({ neutrinoConnect: text })}
              />
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
          {this.state.error != '' && (
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
    this.state = { unlockingWallet: undefined };
  }

  componentDidMount() {
    this.checkStateAndNavigate();
  }

  // will return true if navigating.
  checkStateAndNavigate = async () => {
    console.log('Checking state and navigating');
    const lndRunning = await this.props.isLndProcessRunning();
    if (!lndRunning) {
      // nothing to do
      return;
    }

    const runningWallet = await this.props.getRunningWallet();

    // check if we are at genseed stage
    try {
      console.log('Looking for GenSeed');
      const seed = await this.props.genSeed();
      if (seed.cipher_seed_mnemonic) {
        console.log('Found GenSeed, navigating to it');
        this.props.navigation.navigate('GenSeed', { seedResponse: seed });
        return true;
      } else if (seed.error == 'wallet already exists') {
        console.log('Wallet already created, asking for password');
        this.setState({ unlockingWallet: runningWallet });
        return false;
      }
    } catch (err) {
      console.log('past the walletunlocker stage ?');
      console.log(err);
    }

    try {
      console.log('Looking for getinfo');
      const getinfo = await this.props.lndApi.getInfo();
      if (getinfo.identity_pubkey) {
        console.log('Found GetInfo, navigating to Wallet');
        this.props.navigation.navigate('Wallet');
        return true;
      }
    } catch (err) {
      console.log(err);
    }

    console.error("Couldn't determine wallet state!");
  };

  render() {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.logoContainer}>
          <View style={styles.simpleContainer}>
            <Image
              source={require('./assets/intro-logo.png')}
              style={{
                width: undefined,
                height: 150,
                flex: 1,
                resizeMode: 'contain',
              }}
            />
          </View>
          <View style={styles.simpleContainer}>
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit={true}
              style={styles.slogan}
            >
              Bitcoin Lightning Network wallet
            </Text>
          </View>
        </View>
        <LndConsumer>
          {({ addWallet, wallets }) => (
            <View style={styles.actionContainer}>
              <View style={styles.buttonContainer}>
                <UnlockWallet
                  wallets={wallets}
                  unlockingWallet={this.state.unlockingWallet}
                  navigate={this.props.navigation.navigate}
                  unlockwallet={this.props.lndApi.unlockwallet}
                  stopLndFromWallet={this.props.stopLndFromWallet}
                  unlockWallet={async w => {
                    await this.props.startLndFromWallet(w);
                    return await this.checkStateAndNavigate();
                  }}
                />
              </View>
              <View style={styles.buttonContainer}>
                <CreateWallet
                  addWallet={async newWallet => {
                    newWallet = await addWallet(newWallet);
                    await this.props.startLndFromWallet(newWallet);
                    this.props.navigation.navigate('GenSeed', {
                      wallet: newWallet,
                    });
                  }}
                />
              </View>
            </View>
          )}
        </LndConsumer>
      </ScrollView>
    );
  }
}

export default withLnd(ScreenIntroCreateUnlockWallet);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LOGO_COLOR,
  },
  simpleContainer: {
    flex: 1,
  },
  logoContainer: {
    flex: 3,
    padding: 50,
    paddingTop: 20,
  },
  actionContainer: {
    flex: 8,
  },
  slogan: {
    alignSelf: 'center',
    color: 'white',
    flex: 1,
    fontSize: 16,
  },
  nWallets: {
    fontSize: 22,
    color: 'white',
  },
  buttonContainer: {
    flex: 1,
  },
});

const buttonStyles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 10,
    margin: 10,
    width: '80%',
    alignSelf: 'center',
    elevation: 1,
  },
  actionText: {
    fontSize: 16,
    color: 'black',
    padding: 20,
  },
});

const unlockWalletStyles = StyleSheet.create({
  noWalletText: {
    fontSize: 16,
    color: 'black',
  },
  contentContainer: {
    padding: 20,
    paddingTop: 0,
  },
  buttonContainer: {
    flex: 5,
  },
  buttonActivityContainer: {
    flexDirection: 'row',
    flex: 1,
  },
  button: {
    margin: 5,
    color: LOGO_COLOR,
    borderWidth: 2,
    borderColor: LOGO_COLOR,
    margin: 10,
    padding: 10,
    borderRadius: 10,
    flex: 1,
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cancelButton: {
    color: 'red',
  },
  disabledStyle: {
    borderColor: 'gray',
    color: 'gray',
  },
});

const createWalletStyles = StyleSheet.create({
  nameInput: {
    height: 50,
    borderColor: LOGO_COLOR,
    borderWidth: 2,
    borderRadius: 10,
    marginBottom: 10,
  },
  container: {
    padding: 20,
    paddingTop: 0,
  },
  radioText: {
    fontSize: 16,
    marginBottom: 10,
  },
  subtitle: {
    marginBottom: 5,
  },
  warningText: {
    fontSize: 12,
    color: 'red',
  },
  buttonText: {
    color: LOGO_COLOR,
    padding: 10,
  },
});
