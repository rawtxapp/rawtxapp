import React, { Component } from 'react';

import {
  Image,
  LayoutAnimation,
  StyleSheet,
  ScrollView,
  Text,
  TouchableWithoutFeedback,
  View,
  UIManager,
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

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental &&
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

class ExpandableButton extends Component {
  constructor(props) {
    super(props);
    this.state = {
      expanded: false,
    };
  }

  render() {
    return (
      <View style={[buttonStyles.container, this.props.style]}>
        <TouchableWithoutFeedback
          onPress={() => {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
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
      creating: undefined,
    };
  }
  render() {
    const { wallets } = this.props;
    let content;
    if (wallets && wallets.length <= 0) {
      let content = (
        <Text style={unlockWalletStyles.noWalletText}>
          You haven't created any wallets yet.
        </Text>
      );
    } else if (!this.state.creating && wallets && wallets.length > 0) {
      content = (
        <View>
          <Text style={unlockWalletStyles.noWalletText}>
            Select wallet to unlock:
          </Text>

          {this.props.wallets.map((w, i) => {
            return (
              <View key={i}>
                <Button
                  style={unlockWalletStyles.button}
                  onPress={() => {
                    LayoutAnimation.spring();
                    this.setState({ creating: w });
                  }}
                >
                  {w.name}
                </Button>
              </View>
            );
          })}
        </View>
      );
    } else if (this.state.creating) {
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
              style={[unlockWalletStyles.button, unlockWalletStyles.cancelButton]}
              onPress={() => {
                LayoutAnimation.spring();
                this.setState({ creating: undefined });
              }}
            >
              Cancel
            </Button>

            <Button
              style={unlockWalletStyles.button}
              onPress={() => {
                // TODO:
              }}
            >
              Unlock
            </Button>
          </View>
        </View>
      );
    }
    return (
      <ExpandableButton text="Unlock existing wallet">
        <View style={unlockWalletStyles.contentContainer}>{content}</View>
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
      this.setState({ creating: true }, async () => {
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
          <Button style={createWalletStyles.buttonText} onPress={addWallet}>
            Create wallet
          </Button>
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

export default class ScreenIntroCreateUnlockWallet extends Component {
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
                <UnlockWallet wallets={wallets} />
              </View>
              <View style={styles.buttonContainer}>
                <CreateWallet
                  addWallet={async function(newWallet) {
                    await addWallet(newWallet);
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
  button: {
    margin: 5,
    color: LOGO_COLOR,
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end'
  },
  cancelButton: {
    color: 'red'
  }
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
