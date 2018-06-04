import React, { Component } from "react";
import { StyleSheet, Text, View } from "react-native";
import { styles as theme } from "react-native-theme";
import Button from "react-native-button";
import withLnd from "./withLnd";

class ComponentChannelItem extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    this._fetchAlias();
  }

  _fetchAlias = async () => {
    try {
      const { node } = await this.props.lndApi.getNodeInfo(
        this.props.channel.remote_pubkey
      );
      if (node.alias) {
        this.setState({ alias: node.alias });
      }
    } catch (err) {}
  };

  render() {
    const { channel } = this.props;
    const localPct = Math.round(
      parseInt(channel.local_balance) /
        (parseInt(channel.local_balance) +
          (parseInt(channel.remote_balance) || 0)) *
        100
    );
    const remotePct = 100 - localPct;
    return (
      <View style={styles.container}>
        <View style={styles.infoContainer}>
          <Text>
            <Text style={styles.field}>With </Text>
            <Text>
              {!!this.state.alias ? this.state.alias : channel.remote_pubkey}
            </Text>
          </Text>
          <Text>
            <Text style={styles.field}>Total capacity </Text>
            <Text>{channel.capacity}</Text>
          </Text>
          <View style={styles.localRemoteContainer}>
            <Text>
              <Text style={styles.field}>local </Text>
              <Text>{channel.local_balance || 0}</Text>
            </Text>
            <Text>
              <Text style={styles.field}>remote </Text>
              <Text>{channel.remote_balance || 0}</Text>
            </Text>
          </View>
          <View style={styles.barContainer}>
            <View
              style={[
                theme.localBalanceBar,
                { width: localPct.toString() + "%", height: 8 }
              ]}
            />
            <View
              style={[
                theme.remoteBalanceBar,
                {
                  width: remotePct.toString() + "%",
                  height: 8
                }
              ]}
            />
          </View>
        </View>
        <View style={styles.buttonContainer}>
          <View
            style={
              channel.active
                ? theme.channelStatusActiveContainer
                : theme.channelStatusInactiveContainer
            }
          >
            <Text
              style={
                channel.active
                  ? theme.successTextColorOnly
                  : theme.errorTextColorOnly
              }
            >
              {channel.active ? "" : "in"}active
            </Text>
          </View>
          <Button
            style={[
              theme.errorActionButtonFull,
              this.state.closed && theme.errorActionButton,
              styles.closeButton
            ]}
            onPress={() => {
              if (this.state.closed) return;
              this.props.lndApi.closeChannel(channel.channel_point);
              this.setState({ closed: true });
            }}
          >
            close
          </Button>
        </View>
      </View>
    );
  }
}

export default withLnd(ComponentChannelItem);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: 10
  },
  infoContainer: {
    flex: 1
  },
  buttonContainer: {
    flex: 0,
    flexShrink: 1
  },
  closeButton: {
    padding: 5,
    fontSize: 12
  },
  field: {
    fontSize: 18
  },
  localRemoteContainer: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  barContainer: {
    flexDirection: "row"
  }
});
