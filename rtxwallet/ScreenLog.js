/* @flow */
import React, { Component } from 'react';

import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Button from 'react-native-button';
import LogConsumer from './ContextLog.js';
import LndConsumer from './ContextLnd.js';

type Props = {};
export default class ScreenLog extends Component<Props> {
  constructor(props) {
    super(props);

    this.state = {
      showing: 'logs',
      textContent: '',
    };
  }

  makeText(content) {
    return (
      <View style={styles.textContainer}>
        <ScrollView>
          <Text style={styles.text}>{content}</Text>
        </ScrollView>
      </View>
    );
  }

  switchToGetJson(jsonGetterFn) {
    return () => {
      this.setState({ textContent: '', showing: 'textContent' });
      jsonGetterFn()
        .then(json => JSON.stringify(json, null, 2))
        .then(jsonStr => this.setState({ textContent: jsonStr }));
    };
  }

  switchToLogs() {
    return () => {
      this.setState({ showing: 'logs' });
    };
  }

  render() {
    const logs = () => (
      <LogConsumer>{({ logText }) => this.makeText(logText)}</LogConsumer>
    );

    let text;
    switch (this.state.showing) {
      case 'showing':
        text = logs();
        break;

      case 'textContent':
        text = this.makeText(this.state.textContent);
        break;

      default:
        text = logs();
    }

    return (
      <View style={styles.container}>
        {text}
        <LndConsumer>
          {({ startLnd, stopLnd, getLndInfo, genSeed }) => (
            <ScrollView style={styles.buttonContainer} horizontal={true}>
              <Button
                containerStyle={styles.buttonStyle}
                style={{ fontSize: 20, color: 'green' }}
                onPress={startLnd}
              >
                Start
              </Button>
              <Button
                containerStyle={styles.buttonStyle}
                style={{ fontSize: 20, color: 'red' }}
                onPress={stopLnd}
              >
                Stop
              </Button>
              <Button
                containerStyle={styles.buttonStyle}
                style={{ fontSize: 20, color: 'black' }}
                onPress={this.switchToLogs()}
              >
                Logs
              </Button>
              <Button
                containerStyle={styles.buttonStyle}
                style={{ fontSize: 20, color: 'black' }}
                onPress={this.switchToGetJson(getLndInfo)}
              >
                Info
              </Button>
              <Button
                containerStyle={styles.buttonStyle}
                style={{ fontSize: 20, color: 'black' }}
                onPress={this.switchToGetJson(genSeed)}
              >
                GenSeed
              </Button>
            </ScrollView>
          )}
        </LndConsumer>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  textContainer: {
    flex: 9,
    backgroundColor: 'black',
  },
  text: {
    color: 'white',
  },
  buttonContainer: {
    flex: 1,
    backgroundColor: 'red',
    flexDirection: 'row',
  },
  buttonStyle: {
    padding: 10,
    overflow: 'hidden',
    borderRadius: 4,
    backgroundColor: 'white',
    justifyContent: 'center',
    flex: 1,
    margin: 10,
  },
});
