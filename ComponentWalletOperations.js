import React, { Component } from "react";
import { Modal, Platform, StyleSheet, Text, View } from "react-native";
import withLnd from "./withLnd";
import { styles as theme } from "react-native-theme";
import Button from "react-native-button";
import ScreenGraphList from "./ScreenGraphList";
import ScreenLog from "./ScreenLog";
import ScreenAbout from "./ScreenAbout";
import ComponentActionSheet from "./ComponentActionSheet";

class ComponentWalletOperations extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showingGraphNodes: false,
      showingLogs: false,
      showingAbout: false
    };
  }

  componentDidMount() {
    this.graphInfoListener_ = this.props.walletListener.listenToGraphInfo(
      graphInfo => this.setState({ graphInfo })
    );
  }

  componentWillUnmount() {
    this.graphInfoListener_.remove();
  }

  _renderShowGraphNodes() {
    const cancelOp = () => this.setState({ showingGraphNodes: false });
    return (
      <View>
        <Button
          style={[theme.inCardButton]}
          onPress={() => this.setState({ showingGraphNodes: true })}
        >
          Show network graph nodes
        </Button>

        <ComponentActionSheet
          visible={this.state.showingGraphNodes}
          onRequestClose={cancelOp}
          animationType="slide"
          title="Graph list"
          buttonText="Done"
        >
          <ScreenGraphList />
        </ComponentActionSheet>
      </View>
    );
  }

  _renderShowLogs() {
    if (Platform.OS == "ios") return;
    const cancelOp = () => this.setState({ showingLogs: false });
    return (
      <View>
        <View style={theme.separator} />
        <Button
          style={[theme.inCardButton]}
          onPress={() => this.setState({ showingLogs: true })}
        >
          Show lnd logs
        </Button>

        <Modal
          visible={this.state.showingLogs}
          onRequestClose={cancelOp}
          animationType="slide"
        >
          <ScreenLog onCancel={cancelOp} />
        </Modal>
      </View>
    );
  }

  _renderShowAbout() {
    const cancelOp = () => this.setState({ showingAbout: false });
    return (
      <View>
        <Button
          style={[theme.inCardButton]}
          onPress={() => this.setState({ showingAbout: true })}
        >
          About
        </Button>

        <ComponentActionSheet
          visible={this.state.showingAbout}
          onRequestClose={cancelOp}
          animationType="slide"
          title="About"
          buttonText="Done"
        >
          <ScreenAbout />
        </ComponentActionSheet>
      </View>
    );
  }

  _renderGraphSummary = () => {
    if (!this.state.graphInfo) return;
    return (
      <View>
        <Text style={theme.infoLabel}>Lightning network graph info</Text>

        <Text style={theme.infoValue}>
          <Text style={theme.smallInfoLabel}>Average out degree: </Text>
          {Math.round(this.state.graphInfo.avg_out_degree * 1000) / 1000}
        </Text>

        <Text style={theme.infoValue}>
          <Text style={theme.smallInfoLabel}>Max out degree: </Text>
          {this.state.graphInfo.max_out_degree}
        </Text>

        <Text style={theme.infoValue}>
          <Text style={theme.smallInfoLabel}>Number of nodes: </Text>
          {this.state.graphInfo.num_nodes}
        </Text>

        <Text style={theme.infoValue}>
          <Text style={theme.smallInfoLabel}>Number of channels: </Text>
          {this.state.graphInfo.num_channels}
        </Text>

        <Text style={theme.infoValue}>
          <Text style={theme.smallInfoLabel}>Total network capacity: </Text>
          {this.props.displaySatoshi(
            this.state.graphInfo.total_network_capacity
          )}
        </Text>

        <Text style={theme.infoValue}>
          <Text style={theme.smallInfoLabel}>Average channel size: </Text>
          {this.props.displaySatoshi(
            Math.round(this.state.graphInfo.avg_channel_size)
          )}
        </Text>

        <Text style={theme.infoValue}>
          <Text style={theme.smallInfoLabel}>Min channel size: </Text>
          {this.props.displaySatoshi(
            Math.round(this.state.graphInfo.min_channel_size)
          )}
        </Text>

        <Text style={theme.infoValue}>
          <Text style={theme.smallInfoLabel}>Max channel size: </Text>
          {this.props.displaySatoshi(
            Math.round(this.state.graphInfo.max_channel_size)
          )}
        </Text>
      </View>
    );
  };

  render() {
    return (
      <View style={theme.container}>
        <Text style={theme.accountHeader}>Wallet operations</Text>
        {this._renderGraphSummary()}
        <View style={theme.separator} />
        {this._renderShowGraphNodes()}
        {this._renderShowLogs()}
        <View style={theme.separator} />
        {this._renderShowAbout()}
      </View>
    );
  }
}

export default withLnd(ComponentWalletOperations);

const styles = StyleSheet.create({});
