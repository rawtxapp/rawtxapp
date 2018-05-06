import React, { Component } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  View,
  Text,
  TextInput
} from "react-native";

import shared from "./SharedStyles.js";
import Button from "react-native-button";
import withLnd from "./withLnd.js";

class ScreenChannels extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    this.getChannels();
  }

  getChannels = async () => {
    try {
      const { channels } = await this.props.lndApi.channels();
      this.setState({ channels });
    } catch (error) {
      this.setState({ error });
    }
  };

  _renderChannelItem = (c, ix) => {
    const errorKey = "error" + c.chan_id;
    const successKey = "success" + c.chan_id;
    const closeChannelDisableKey = "disable" + c.chan_id;
    return (
      <View key={ix} style={styles.nodeItem}>
        <Text selectable>
          <Text style={shared.boldText}>Channel id: </Text>
          {c.chan_id}
        </Text>

        <Text selectable>
          <Text style={shared.boldText}>Capacity: </Text>
          {c.capacity}
        </Text>

        <Text selectable>
          <Text style={shared.boldText}>Local balance: </Text>
          {c.local_balance}
        </Text>

        <Text selectable>
          <Text style={shared.boldText}>Remote balance: </Text>
          {c.remote_balance}
        </Text>

        <Text selectable>
          <Text style={shared.boldText}>Is active: </Text>
          {c.active ? "yes" : "no"}
        </Text>

        <Button
          style={[shared.smallButton, shared.textAlignLeft]}
          disabled={this.state[closeChannelDisableKey]}
          styleDisabled={shared.disabledButton}
          onPress={async () => {
            this.setState({ [closeChannelDisableKey]: true });
            try {
              const result = await this.props.lndApi.closeChannel(
                c.channel_point
              );
              this.setState({ [successKey]: "Request for closure sent!" });
            } catch (err) {
              if (err == "timeout") {
                this.setState({
                  [errorKey]:
                    "Received a timeout, but it's possible channel is being closed in the background."
                });
              } else {
                this.setState({ [errorKey]: JSON.stringify(err.message) });
              }
            }
          }}
        >
          Close channel
        </Button>
        {this.state[errorKey] && (
          <Text style={shared.errorText}>{this.state[errorKey]}</Text>
        )}
        {this.state[successKey] && (
          <Text style={shared.successText}>{this.state[successKey]}</Text>
        )}
      </View>
    );
  };

  _renderChannelList = () => {
    if (!this.state.channels || this.state.channels.length == 0) {
      return (
        <View>
          <Text>No channels.</Text>
        </View>
      );
    }
    return (
      <View>
        {this.state.channels.map((c, i) => this._renderChannelItem(c, i))}
      </View>
    );
  };

  render() {
    return (
      <View style={[shared.containerStyleOnly, shared.flexOne]}>
        <View style={styles.scrollContainer}>
          <ScrollView contentContainerStyle={styles.scrollStyle}>
            {this._renderChannelList()}
          </ScrollView>
        </View>
        <View style={[styles.actionContainer, shared.centerPrimaryAxis]}>
          <Button style={[shared.inCardButton]} onPress={this.props.onDone}>
            Done
          </Button>
        </View>
      </View>
    );
  }
}

export default withLnd(ScreenChannels);

const styles = StyleSheet.create({
  nodeItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: "#BDBDBD"
  },
  scrollContainer: {
    flex: 9
  },
  actionContainer: {
    flex: 1,
    borderTopWidth: 1,
    borderColor: "gray"
  }
});
