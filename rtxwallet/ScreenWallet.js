import React, { Component } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import withLnd from './withLnd.js';
import { LOGO_COLOR } from './Colors.js';

import Button from 'react-native-button';

class ScreenWallet extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    this.setRunningWallet();
  }

  setRunningWallet = async () => {
    const wallet = await this.props.getRunningWallet();
    const getinfo = await this.props.lndApi.getInfo();
    this.setState({ wallet, getinfo });
  };

  render() {
    return (
      <View style={styles.container}>
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
  }
}

export default withLnd(ScreenWallet);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LOGO_COLOR,
  },
});
