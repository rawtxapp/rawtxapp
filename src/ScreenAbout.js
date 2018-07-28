import React, { Component } from "react";

import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import Button from "react-native-button";
import { styles as theme } from "react-native-theme";

import withLnd from "./withLnd";

class ScreenAbout extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    this.getDev();
  }

  getDev = async () => {
    try {
      const httpsCert = await this.props.getWalletFile("tls.cert");
      const adminMacaroon = await this.props.getWalletMacaroon(
        "admin.macaroon"
      );
      const readonlyMacaroon = await this.props.getWalletMacaroon(
        "readonly.macaroon"
      );
      const invoiceMacaroon = await this.props.getWalletMacaroon(
        "invoice.macaroon"
      );
      this.setState({
        httpsCert,
        adminMacaroon,
        readonlyMacaroon,
        invoiceMacaroon
      });
    } catch (e) {}
  };

  render() {
    return (
      <View style={styles.container}>
        <ScrollView>
          <View style={styles.paragraph}>
            <Text style={theme.boldText}>rawtx v0.1</Text>
            <Text style={theme.boldText}>Copyright (C) 2018 rawtx</Text>
          </View>
          <View style={styles.paragraph}>
            <Text style={theme.boldText}>lnd v0.4.2</Text>
            <Text style={theme.boldText}>
              Copyright (C) 2015-2018 The Lightning Network Developers
            </Text>
          </View>

          <View style={theme.paragraph}>
            <Text style={theme.boldText}>Support</Text>
            <Text style={theme.boldText} selectable>
              https://rawtx.com
            </Text>
            <Text style={theme.boldText}>support@rawtx.com</Text>
            <Text style={theme.boldText} selectable>
              twitter.com/rawtxapp
            </Text>
            <Text style={theme.boldText} selectable>
              reddit.com/u/rawtxapp
            </Text>
            <Text style={theme.boldText} selectable>
              slack: @rawtx on lightningcommunity.slack.com
            </Text>
          </View>

          <View style={styles.spacer} />

          <Text style={theme.paragraph}>
            If you're interested in talking to the lnd server that's running on
            your phone, here are the certs and macaroons:
          </Text>
          <View style={styles.spacer} />
          <Text style={theme.boldText}>Https cert:</Text>
          <Text style={theme.selectableText} multiline={true} selectable>
            {this.state.httpsCert}
          </Text>
          <View style={styles.spacer} />
          <Text style={theme.boldText}>admin macaroon:</Text>
          <Text style={theme.selectableText} multiline={true} selectable>
            {this.state.adminMacaroon}
          </Text>
          <View style={styles.spacer} />
          <Text style={theme.boldText}>readonly macaroon:</Text>
          <Text style={theme.selectableText} multiline={true} selectable>
            {this.state.readonlyMacaroon}
          </Text>
          <View style={styles.spacer} />
          <Text style={theme.boldText}>invoice macaroon:</Text>
          <Text style={theme.selectableText} multiline={true} selectable>
            {this.state.invoiceMacaroon}
          </Text>
        </ScrollView>
      </View>
    );
  }
}

export default withLnd(ScreenAbout);

const styles = StyleSheet.create({
  container: {
    padding: 5
  },
  spacer: {
    height: 20
  },
  paragraph: {
    marginVertical: 10
  }
});
