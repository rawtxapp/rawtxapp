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
    const errorKey = "error" + c.chain_id;
    const successKey = "success" + c.chain_id;
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
          onPress={async () => {
            try {
              const result = await this.props.lndApi.closeChannel(
                c.channel_point
              );
            } catch (err) {
              this.setState({ [errorKey]: JSON.stringify(err) });
            }
          }}
        >
          Close channel
        </Button>
        {this.state[errorKey] && <Text>{this.state[errorKey]}</Text>}
        {this.state[successKey] && <Text>{this.state[successKey]}</Text>}
      </View>
    );
  };

  _renderChannelList = () => {
    if (!this.state.channels) return;
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
