import React, { Component } from "react";
import {
  Modal,
  FlatList,
  StyleSheet,
  View,
  Text,
  TextInput
} from "react-native";

import { styles as theme } from "react-native-theme";
import Button from "react-native-button";
import withLnd from "./withLnd.js";
import withTheme from "./withTheme.js";
import ComponentChannelItem from "./ComponentChannelItem";

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
          <Text style={theme.boldText}>Channel id: </Text>
          {c.chan_id}
        </Text>

        <Text selectable>
          <Text style={theme.boldText}>Capacity: </Text>
          {c.capacity}
        </Text>

        <Text selectable>
          <Text style={theme.boldText}>Local balance: </Text>
          {c.local_balance}
        </Text>

        <Text selectable>
          <Text style={theme.boldText}>Remote balance: </Text>
          {c.remote_balance}
        </Text>

        <Text selectable>
          <Text style={theme.boldText}>Is active: </Text>
          {c.active ? "yes" : "no"}
        </Text>

        <Button
          style={[theme.smallButton, theme.textAlignLeft]}
          disabled={this.state[closeChannelDisableKey]}
          styleDisabled={theme.disabledButton}
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
          <Text style={theme.errorText}>{this.state[errorKey]}</Text>
        )}
        {this.state[successKey] && (
          <Text style={theme.successText}>{this.state[successKey]}</Text>
        )}
      </View>
    );
  };

  _keyExtractor = (c, ix) => c.chan_id;

  render() {
    return (
      <View>
        <FlatList
          data={this.state.channels}
          renderItem={({ item: channel }) => (
            <ComponentChannelItem channel={channel} />
          )}
          keyExtractor={this._keyExtractor}
          ListEmptyComponent={<Text>There are no channels.</Text>}
          ItemSeparatorComponent={() => (
            <View style={this.props.theme.separator} />
          )}
        />
      </View>
    );
  }
}

export default withTheme(withLnd(ScreenChannels));

const styles = StyleSheet.create({
  nodeItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: "#BDBDBD"
  }
});
