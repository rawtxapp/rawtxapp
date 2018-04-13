import React, { Component } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  View,
  Text,
} from 'react-native';
import withLnd from './withLnd.js';
import TimerMixin from 'react-timer-mixin';
import ReactMixin from 'react-mixin';
import { LOGO_COLOR } from './Colors.js';
import { timeout } from './Utils.js';

import Button from 'react-native-button';

class SyncingBlock extends Component {
  render() {
    return (
      <View style={syncingBlockStyles.container}>
        <Text>Syncing</Text>
      </View>
    );
  }
}

class ScreenWallet extends Component {
  constructor(props) {
    super(props);
    this.state = {wallet:undefined,getinfo:undefined};
  }

  componentDidMount() {
    this.setRunningWallet();
    this.i = 0;
    this.watchGetInfo();
  }

  setRunningWallet = async () => {
    if (!this.state.wallet || !this.state.getinfo) {
      try {
        const wallet = await this.props.getRunningWallet();
        const getinfo = await this.props.lndApi.getInfo();
        this.setState({ wallet, getinfo });
      } catch (err) {
        console.log('ScreenWallet'+err)
        this.setTimeout(this.setRunningWallet, 1000)
      }
    }
  };

  watchGetInfo = async () => {
    try {
      const getinfo = await this.props.lndApi.getInfo();
      getinfo['testIx'] = this.i++;
      this.setState({ getinfo });
    } catch (err) {}
    this.setTimeout(this.watchGetInfo, 1000);
  };

  render() {
    let content;
    if (!this.state.wallet || !this.state.getinfo) {
      content = (
        <View>
          <ActivityIndicator />
        </View>
      );
    } else if (true) {
      content = (
        <View>
          <Text>{JSON.stringify(this.state.wallet)}</Text>
          <Text>{JSON.stringify(this.state.getinfo)}</Text>
          <Button
            onPress={async () => {
              await this.props.stopLndFromWallet(this.state.wallet);
              this.props.navigation.navigate('WalletCreate');
            }}
          >
            Close wallet
          </Button>
        </View>
      );
    } else {
      content = (
        <View>
          <SyncingBlock />
        </View>
      );
    }
    return (
      <ScrollView style={styles.container}>
        <View style={styles.logoContainer}>
          <Image
            source={require('./assets/intro-logo.png')}
            style={{
              width: undefined,
              height: 80,
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
    backgroundColor: LOGO_COLOR,
  },
  logoContainer: {
    flex: 1,
  },
  restContainer: {
    flex: 8,
  },
});

const syncingBlockStyles = StyleSheet.create({
  container: {
    borderRadius: 10,
    backgroundColor: 'white',
    padding: 10,
    margin: 10,
    marginLeft: 30,
    marginRight: 30,
  },
});
