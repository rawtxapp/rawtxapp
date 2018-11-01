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

  _keyExtractor = (c, ix) => c.channel_point;

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
