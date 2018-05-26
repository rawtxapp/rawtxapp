import React, { Component } from "react";
import {
  AsyncStorage,
  Linking,
  Platform,
  StyleSheet,
  Text,
  ToastAndroid,
  View
} from "react-native";
import Button from "react-native-button";
import withTheme from "./withTheme";
import { styles as theme } from "react-native-theme";
import withLnd from "./withLnd";

const ASKED_KEY = "@ComponentFeedback:asked";

class ComponentAskFeedback extends Component {
  constructor(props) {
    super(props);
    this.state = {
      stateAskingFeedback: false,
      statePositive: false,
      stateNegative: false,
      stateThanks: false
    };
  }

  componentDidMount() {
    this.determineState();
  }

  determineState = async () => {
    let asked = true;
    try {
      const value = await AsyncStorage.getItem(ASKED_KEY);
      if (value === null) {
        asked = false;
      }
    } catch (e) {}
    if (asked) return;
    const { payments } = await this.props.lndApi.getPayments();
    if (payments && payments.length >= 10) {
      this.setState({ stateAskingFeedback: true });
    }
  };

  render() {
    if (Platform.OS != "android" || !this.state.stateAskingFeedback) {
      return <View />;
    }
    if (this.state.stateThanks) {
      return (
        <View style={theme.container}>
          <Text style={theme.boldText}>Thank you!</Text>
          <Button
            style={[theme.inCardButton]}
            onPress={() => {
              this.setState({ stateAskingFeedback: false });
            }}
          >
            Done
          </Button>
        </View>
      );
    }
    if (this.state.statePositive) {
      return (
        <View style={theme.container}>
          <Text>
            <Text style={theme.boldText}>Awesome! </Text>Please leave a feedback
            on the Play store so that we can improve the app even further!
          </Text>
          <Button
            style={[theme.inCardButton]}
            onPress={() => {
              try {
                AsyncStorage.setItem(ASKED_KEY, "leftFeedback");
              } catch (err) {}
              Linking.openURL(
                "https://play.google.com/store/apps/details?id=com.rtxwallet"
              ).then(() => {
                this.setState({ stateThanks: true });
              });
            }}
          >
            Leave feedback!
          </Button>
          <Button
            style={[theme.inCardButton, theme.cancelButton]}
            onPress={() => {
              this.setState({ stateAskingFeedback: false });
              try {
                // 10 is the checkpoint/# of txs where we showed
                // a request review.
                // Might want to add possibility of asking after 100txs if
                // the user said not now.
                AsyncStorage.setItem(ASKED_KEY, "10");
              } catch (err) {}
            }}
          >
            Not now!
          </Button>
        </View>
      );
    }
    if (this.state.stateNegative) {
      return (
        <View style={theme.container}>
          <Text>
            <Text style={theme.boldText}>We want to improve! </Text>Please tell
            us what's wrong, you can email at support@rawtx.com.
          </Text>
          <Button
            style={[theme.inCardButton]}
            onPress={() => {
              this.setState({ stateAskingFeedback: false });
              try {
                AsyncStorage.setItem(ASKED_KEY, "negativeFeedback");
              } catch (err) {}
            }}
          >
            Done
          </Button>
        </View>
      );
    }
    return (
      <View style={theme.container}>
        <Text>Looks like you've sent more than 10 lightning transactions!</Text>
        <Text>Do you like rawtx app ?</Text>
        <Button
          style={[theme.inCardButton]}
          onPress={() => {
            this.setState({ statePositive: true });
          }}
        >
          Yes!
        </Button>
        <Button
          style={[theme.inCardButton, theme.cancelButton]}
          onPress={() => {
            this.setState({ stateNegative: true });
          }}
        >
          No!
        </Button>
      </View>
    );
  }
}

export default withLnd(ComponentAskFeedback);

const styles = StyleSheet.create({});
