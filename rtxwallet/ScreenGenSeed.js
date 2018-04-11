import React, { Component } from 'react';
import {
  LayoutAnimation,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  Text,
} from 'react-native';

import Button from 'react-native-button';
import { LOGO_COLOR } from './Colors.js';
import LndConsumer from './ContextLnd.js';
import { withLnd } from './withLnd.js';

class ScreenGenSeed extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cipher: [],
      errorMessage: '',
      confirmErrorMessage: '',
      confirming: false,
      settingPassword: false,
    };
  }

  componentDidMount() {
    const { params } = this.props.navigation.state;
    if (
      params &&
      params.seedResponse &&
      params.seedResponse.cipher_seed_mnemonic
    ) {
      this.setState({ cipher: params.seedResponse.cipher_seed_mnemonic });
    } else if (this.state.cipher.length == 0) {
      this.initSeed();
    }

    this.initRunningWallet();
  }

  initRunningWallet = async () => {
    const runningWallet = await this.props.getRunningWallet();
    this.setState({ runningWallet });
  };

  initSeed = async () => {
    try {
      const { lndApi } = this.props;
      const seed = await lndApi.genSeed();
      console.log(seed);
      if (seed.cipher_seed_mnemonic) {
        this.setState({ cipher: seed.cipher_seed_mnemonic });
      } else {
        this.setState({
          errorMessage:
            'There was a problem getting the seed, is a wallet already open ?',
        });
      }
    } catch (err) {
      this.setState({ errorMessage: "Couldn't get a seed: " + err });
    }
  };

  render() {
    let content;
    if (this.state.errorMessage && this.state.errorMessage != '') {
      content = <Text>{this.state.errorMessage}</Text>;
    } else if (this.state.settingPassword) {
      content = (
        <View style={styles.container}>
          <Text style={styles.text}>Please set a password:</Text>
          <View style={styles.textContainer}>
            <TextInput
              multiline={false}
              secureTextEntry={true}
              underlineColorAndroid="transparent"
              style={styles.textInput}
              placeholder="Password"
              value={this.state.password}
              onChangeText={t => this.setState({ password: t })}
            />
          </View>
          <View style={styles.textContainer}>
            <TextInput
              multiline={false}
              secureTextEntry={true}
              underlineColorAndroid="transparent"
              style={styles.textInput}
              placeholder="Password confirm"
              value={this.state.passwordConfirm}
              onChangeText={t => this.setState({ passwordConfirm: t })}
            />
          </View>
          <View>
            <Text style={styles.errorMessage}>
              {this.state.passwordErrorMessage}
            </Text>
          </View>
          <View>
            <Button
              style={[styles.buttonText, styles.confirm]}
              containerStyle={styles.buttonContainer}
              onPress={async () => {
                if (!this.state.password || this.state.password == '') {
                  this.setState({
                    passwordErrorMessage: 'Please enter a password!',
                  });
                  return;
                }
                if (this.state.password != this.state.passwordConfirm) {
                  this.setState({
                    passwordErrorMessage: "Password confirmation doesn't match",
                  });
                  return;
                }
                const response = await this.props.lndApi.initwallet(
                  this.state.cipher,
                  this.state.password,
                );
                if (response.error) {
                  this.setState({ passwordErrorMessage: response.error });
                  return;
                }
                // TODO: navigate
                console.log('navigating to wallet screen!!');
              }}
            >
              Confirm
            </Button>
          </View>
          <View>
            <Button
              style={[styles.buttonText, styles.cancel]}
              containerStyle={styles.buttonContainer}
              onPress={() => {
                LayoutAnimation.easeInEaseOut();
                this.setState({
                  seed: '',
                  confirming: true,
                  settingPassword: false,
                });
              }}
            >
              Cancel
            </Button>
          </View>
        </View>
      );
    } else if (this.state.confirming) {
      content = (
        <View style={styles.container}>
          <Text style={styles.text}>Please reenter your seed to confirm:</Text>
          <View style={styles.textContainer}>
            <TextInput
              multiline={true}
              underlineColorAndroid="transparent"
              style={styles.textInput}
              placeholder="Seed"
              value={this.state.seed}
              onChangeText={t => this.setState({ seed: t })}
            />
          </View>
          <View>
            <Text style={styles.errorMessage}>
              {this.state.confirmErrorMessage}
            </Text>
          </View>
          <View>
            <Button
              style={[styles.buttonText, styles.confirm]}
              containerStyle={styles.buttonContainer}
              onPress={() => {
                if (!this.state.seed || this.state.seed == '') {
                  return;
                }
                LayoutAnimation.easeInEaseOut();
                const enteredSeed = this.state.seed.split(' ').filter(String);
                const equal =
                  enteredSeed.length == this.state.cipher.length &&
                  this.state.cipher.every((v, i) => v == enteredSeed[i]);
                if (equal) {
                  this.setState({
                    settingPassword: true,
                    confirming: false,
                    confirmErrorMessage: '',
                  });
                } else {
                  this.setState({
                    confirmErrorMessage: "Doesn't match generated seed.",
                  });
                }
              }}
            >
              Confirm
            </Button>
          </View>
          <View>
            <Button
              style={[styles.buttonText, styles.cancel]}
              containerStyle={styles.buttonContainer}
              onPress={() => {
                LayoutAnimation.easeInEaseOut();
                this.setState({ seed: '', confirming: false });
              }}
            >
              Cancel
            </Button>
          </View>
          <View>
            <Button
              style={[styles.buttonText, styles.cancel]}
              containerStyle={styles.buttonContainer}
              onPress={() => {
                LayoutAnimation.easeInEaseOut();
                this.setState({ seed: this.state.cipher.join(' ') });
              }}
            >
              Copy from previous screen (only for testnet)
            </Button>
          </View>
        </View>
      );
    } else if (this.state.cipher && this.state.cipher.length > 0) {
      content = (
        <View style={styles.container}>
          <Text style={styles.text}>The following is your seed:</Text>
          <Text style={styles.text}>{this.state.cipher.join(' ')}</Text>
          <Text style={styles.subinfo}>
            This seed is very important, please note it somewhere, it will be
            used to recover your funds in case something goes wrong.
          </Text>
          <View>
            <View>
              <Button
                style={[styles.buttonText, styles.confirm]}
                containerStyle={styles.buttonContainer}
                onPress={() => {
                  LayoutAnimation.easeInEaseOut();
                  this.setState({ confirming: true });
                }}
              >
                Ok, I wrote it down
              </Button>
            </View>
            <View>
              <Button
                style={[styles.buttonText, styles.confirm]}
                containerStyle={styles.buttonContainer}
                onPress={async () => {
                  await this.initSeed();
                }}
              >
                Regenerate seed
              </Button>
            </View>
            <View>
              <Button
                style={[styles.buttonText, styles.cancel]}
                containerStyle={styles.buttonContainer}
                onPress={async () => {
                  const runningWallet = this.state.runningWallet;
                  const walletDir = await this.props.walletDir(runningWallet);
                  await this.props.stopLnd(walletDir);
                  this.props.navigation.navigate('WalletCreate');
                }}
              >
                Cancel wallet creation
              </Button>
            </View>
          </View>
        </View>
      );
    }
    return <View style={styles.container}>{content}</View>;
  }
}

export default withLnd(ScreenGenSeed);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LOGO_COLOR,
    padding: 10,
    justifyContent: 'center',
  },
  text: {
    fontSize: 18,
    color: 'white',
    margin: 10,
  },
  subinfo: {
    fontSize: 14,
    color: 'white',
    margin: 20,
  },
  buttonContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    margin: 10,
    width: '80%',
    alignSelf: 'center',
  },
  buttonText: {
    fontSize: 16,
    color: 'black',
    padding: 20,
  },
  textInput: {
    backgroundColor: 'white',
    borderRadius: 10,
    margin: 10,
    flex: 1,
    padding: 10,
  },
  textContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
  cancel: {
    color: 'red',
  },
  confirm: {
    color: LOGO_COLOR,
  },
  errorMessage: {
    fontSize: 12,
    color: 'white',
  },
});
