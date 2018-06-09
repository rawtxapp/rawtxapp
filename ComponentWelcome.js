import React, { Component } from "react";
import { AsyncStorage, Platform, StyleSheet, Text, View } from "react-native";
import { styles as theme } from "react-native-theme";
import Button from "react-native-button";

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
        <Text>
          Please give the app <Text style={theme.boldText}>15-30 mins</Text> to
          sync and bootstrap, you can come back to check it in a while, it will
          work even if you put it in background!
        </Text>
      </View>
    );
  };

  _renderiOSMessage = () => {
    return (
      <View>
        <Text>
          It should take about 15-30 mins to sync with the blockchain after
          which you can start opening channels.
        </Text>
        <Text>
          You can close the app whenever you want, it will continue syncing from
          where it left when you reopen.
        </Text>
      </View>
    );
  };

  render() {
    if (this.state.showed) return <View />;
    return (
      <View style={theme.container}>
        <Text style={theme.accountHeader}>
          Welcome to rawtx lightning wallet!
        </Text>
        {Platform.OS == "ios"
          ? this._renderiOSMessage()
          : this._renderAndroidMessage()}
        <Text>
          Please show what lightning is capable of to your friends and family!
        </Text>
        <Button
          style={[theme.inCardButton]}
          onPress={() => {
            this.setState({ showed: true });
            try {
              AsyncStorage.setItem("@ComponentWelcome:showed", "showed");
            } catch (e) {}
          }}
        >
          Will do!
        </Button>
      </View>
    );
  }
}

const styles = StyleSheet.create({});
