/* @flow */
import React, { Component } from "react";
import {
  ActivityIndicator,
  LayoutAnimation,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import ButtoardSpacer from "react-native-keyboard-spacer";
import Button from "react-native-button";
import { withNavigation } from "react-navigation";
import { convertErrorToStr } from "./Utils.js";
import { styles as theme } from "react-native-theme";
import withLnd from "./withLnd.js";
import RadioForm, {
  RadioButton,
  RadioButtonInput,
  RadioButtonLabel
} from "react-native-simple-radio-button";

import type { LndApi, LNDState } from "./RestLnd";

type Props = {
  addWallet: Object => Object,
  startLndFromWallet: Object => boolean
};
type State = {
  name: string,
  coin: "bitcoin",
  network: "testnet" | "mainnet",
  mode: "neutrino",
  neutrinoConnect: string,
  creating: boolean,
  showSeed: boolean,
  error: string
};
class ComponentCreate extends Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      name: "default",
      coin: "bitcoin",
      network: "testnet",
      mode: "neutrino",
      neutrinoConnect: "rbtcd-t-g.rawtx.com",
      creating: false,
      showSeed: false,
      error: ""
    };
  }
  render() {
    const addWallet = async () => {
      this.setState({ creating: true, error: "" }, async () => {
        try {
          const newWallet = await this.props.addWallet(this.state);
          await this.props.startLndFromWallet(newWallet);
          this.setState({ showSeed: true });
        } catch (error) {
          this.setState({ error: error.toString(), creating: false });
        }
        this.setState({ creating: false });
      });
    };
    return (
      <ScrollView style={styles.container}>
        <View>
          <Text style={styles.subtitle}>Wallet name</Text>
          <TextInput
            style={styles.nameInput}
            underlineColorAndroid="transparent"
            placeholder="Name for wallet"
            defaultValue="default"
            value={this.state.name}
            onChangeText={text => this.setState({ name: text })}
          />
        </View>
        <View>
          <Text style={styles.subtitle}>Cryptocurrency</Text>
          <RadioForm
            buttonColor="white"
            selectedButtonColor="white"
            labelColor="white"
            selectedLabelColor="white"
            radio_props={[{ label: "Bitcoin", value: "bitcoin" }]}
            initial={0}
            animation={false}
            formHorizontal={true}
            onPress={val => this.setState({ coin: val })}
          />
        </View>
        <View>
          <Text style={styles.subtitle}>Network</Text>
          <RadioForm
            buttonColor="white"
            selectedButtonColor="white"
            labelColor="white"
            selectedLabelColor="white"
            radio_props={
              this.props.recklessMode
                ? [
                    { label: "Testnet    ", value: "testnet" },
                    { label: "Mainnet", value: "mainnet" }
                  ]
                : [{ label: "Testnet    ", value: "testnet" }]
            }
            initial={0}
            animation={false}
            formHorizontal={true}
            onPress={val => {
              if (val == "mainnet") {
                this.setState({ neutrinoConnect: "btcd-m-g.rawtx.com" });
              } else {
                this.setState({ neutrinoConnect: "rbtcd-t-g.rawtx.com" });
              }
              this.setState({ network: val });
            }}
          />
        </View>
        {this.state.mode == "neutrino" && (
          <View>
            <Text style={styles.subtitle}>Neutrino peers to add</Text>
            <TextInput
              style={styles.nameInput}
              underlineColorAndroid="transparent"
              placeholder="Neutrino server"
              defaultValue="faucet.lightning.community"
              value={this.state.neutrinoConnect}
              onChangeText={text => this.setState({ neutrinoConnect: text })}
            />
            <Text style={theme.warningText}>
              Adding extra known peers will help you sync faster. You can add
              more peers separated by a comma(,).
            </Text>
          </View>
        )}
        <Button
          style={styles.buttonText}
          onPress={addWallet}
          disabled={this.state.creating}
        >
          Create wallet
        </Button>
        {this.state.creating && <ActivityIndicator />}
        {this.state.error != "" && (
          <Text style={styles.warningText}>{this.state.error}</Text>
        )}
      </ScrollView>
    );
  }
}

export default withNavigation(withLnd(ComponentCreate));

const styles = StyleSheet.create({
  button: {
    margin: 5,
    color: "#0277BD",
    margin: 10,
    padding: 10,
    marginVertical: 5,
    borderRadius: 10,
    flex: 1,
    fontWeight: "300"
  },
  nameInput: {
    height: 50,
    backgroundColor: "#ECEFF1",
    borderRadius: 10,
    marginBottom: 10
  },
  container: {
    padding: 20,
    paddingTop: 10,
    backgroundColor: "rgba(0,0,0,0.3)"
  },
  radioText: {
    fontSize: 16,
    marginBottom: 10
  },
  subtitle: {
    marginBottom: 5,
    color: "white"
  },
  warningText: {
    fontSize: 12,
    color: "red"
  },
  buttonText: {
    color: "white",
    padding: 10
  }
});
