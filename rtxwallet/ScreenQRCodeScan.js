import React, { Component } from 'react';
import { StyleSheet, View, Text } from 'react-native';

import shared from './SharedStyles.js';
import QRCodeScanner from 'react-native-qrcode-scanner';
import Button from 'react-native-button';

export default class ScreenQRCodeScan extends Component {
  render() {
    return (
      <QRCodeScanner
        containerStyle={[shared.container, shared.flexOne]}
        onRead={e => this.props.qrScanned(e.data)}
        cameraStyle={styles.cameraStyle}
        topViewStyle={shared.flexZero}
        bottomContent={
          <View>
            <Text style={styles.instructions}>
              Point the camera to a payment invoice QR code. Make sure the QR
              code fills the container above.
            </Text>
            <Button style={shared.cancelButton} onPress={this.props.dismiss}>
              Cancel
            </Button>
          </View>
        }
        bottomViewStyle={styles.bottomStyle}
      />
    );
  }
}

const styles = StyleSheet.create({
  bottomStyle: {
    height: '10%',
    width: undefined,
  },
  instructions: {
    marginBottom: 20,
  },
  cameraStyle: {
    width: '100%',
    height: '90%',
  },
});
