import React, { Component } from "react";
import { AsyncStorage, StyleSheet, Text, View } from "react-native";
import shared from "./SharedStyles";
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

  render() {
    if (this.state.showed) return <View />;
    return (
      <View style={shared.container}>
        <Text style={shared.accountHeader}>
          Welcome to rawtx lightning wallet!
        </Text>
        <Text>
          Please give the app <Text style={shared.boldText}>15-30 mins</Text> to
          sync and bootstrap, you can come back to check it in a while, it will
          work even if you put it in background!
        </Text>
        <Text>
          Please show what lightning is capable of to your friends and family!
        </Text>
        <Button
          style={[shared.inCardButton]}
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
