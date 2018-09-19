import React, { Component } from "react";
import { AsyncStorage, Platform, StyleSheet, Text, View } from "react-native";
import { styles as theme } from "react-native-theme";
import Button from "react-native-button";
import ComponentActionSheet from "./ComponentActionSheet";

export default class ComponentWelcome extends Component {
  constructor(props) {
    super(props);
    this.state = { showed: true };
  }

  componentDidMount() {
    this.getShowed();
  }

  getShowed = async () => {
    try {
      const value = await AsyncStorage.getItem("@ComponentWelcome:showed");
      if (value === null) {
        this.setState({ showed: false });
      }
    } catch (e) {}
  };

  _renderAndroidMessage = () => {
    return (
      <View>
        <Text style={styles.paragraph}>
          Please give the app <Text style={theme.boldText}>10 minutes</Text> to
          sync.
        </Text>
        <Text style={styles.paragraph}>
          There will be a yellow dot indicator on top right and you can see
          syncing progress in Settings. It will work even if you leave the app
          in the background.
        </Text>
        <Text style={styles.paragraph}>
          Wallet operations won't be available while syncing.
        </Text>
      </View>
    );
  };

  _renderiOSMessage = () => {
    return (
      <View>
        <Text style={styles.paragraph}>
          Please give the app <Text style={theme.boldText}>10 minutes</Text> to
          sync.
        </Text>
        <Text style={styles.paragraph}>
          There will be a yellow dot indicator on top right and you can see
          syncing progress in Settings.You can close the app whenever you want,
          it will continue syncing from where it left when you reopen.
        </Text>
        <Text style={styles.paragraph}>
          Wallet operations won't be available while syncing.
        </Text>
        <Text />
      </View>
    );
  };

  render() {
    return (
      <ComponentActionSheet
        visible={!this.state.showed}
        onRequestClose={() => {
          this.setState({ showed: true });
          try {
            AsyncStorage.setItem("@ComponentWelcome:showed", "showed");
          } catch (e) {}
        }}
        animationType="slide"
        buttonText="Ok"
        title="Welcome"
      >
        <View style={styles.container}>
          {Platform.OS == "ios"
            ? this._renderiOSMessage()
            : this._renderAndroidMessage()}
        </View>
      </ComponentActionSheet>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    padding: 10
  },
  paragraph: {
    marginVertical: 5
  }
});
