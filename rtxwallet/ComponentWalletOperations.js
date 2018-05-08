import React, { Component } from "react";
import { Modal, StyleSheet, Text, View } from "react-native";
import withLnd from "./withLnd";
import shared from "./SharedStyles";
import Button from "react-native-button";
import ScreenGraphList from "./ScreenGraphList";
import ScreenLog from "./ScreenLog";
import ScreenAbout from "./ScreenAbout";

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
          style={[shared.inCardButton]}
          onPress={() => this.setState({ showingGraphNodes: true })}
        >
          Show network graph nodes
        </Button>

        <Modal
          visible={this.state.showingGraphNodes}
          onRequestClose={cancelOp}
          animationType="slide"
        >
          <ScreenGraphList onCancel={cancelOp} />
        </Modal>
      </View>
    );
  }

  _renderShowLogs() {
    const cancelOp = () => this.setState({ showingLogs: false });
    return (
      <View>
        <Button
          style={[shared.inCardButton]}
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
          style={[shared.inCardButton]}
          onPress={() => this.setState({ showingAbout: true })}
        >
          About
        </Button>

        <Modal
          visible={this.state.showingAbout}
          onRequestClose={cancelOp}
          animationType="slide"
        >
          <ScreenAbout onCancel={cancelOp} />
        </Modal>
      </View>
    );
  }

  _renderGraphSummary = () => {
    if (!this.state.graphInfo) return;
    return (
      <View>
        <Text style={shared.boldText}>Lightning network graph info</Text>

        <Text>
          <Text style={shared.boldText}>Average out degree: </Text>
          {Math.round(this.state.graphInfo.avg_out_degree * 1000) / 1000}
        </Text>

        <Text>
          <Text style={shared.boldText}>Max out degree: </Text>
          {this.state.graphInfo.max_out_degree}
        </Text>

        <Text>
          <Text style={shared.boldText}>Number of nodes: </Text>
          {this.state.graphInfo.num_nodes}
        </Text>

        <Text>
          <Text style={shared.boldText}>Number of channels: </Text>
          {this.state.graphInfo.num_channels}
        </Text>

        <Text>
          <Text style={shared.boldText}>Total network capacity: </Text>
          {this.props.displaySatoshi(
            this.state.graphInfo.total_network_capacity
          )}
        </Text>

        <Text>
          <Text style={shared.boldText}>Average channel size: </Text>
          {this.props.displaySatoshi(
            Math.round(this.state.graphInfo.avg_channel_size)
          )}
        </Text>

        <Text>
          <Text style={shared.boldText}>Min channel size: </Text>
          {this.props.displaySatoshi(
            Math.round(this.state.graphInfo.min_channel_size)
          )}
        </Text>

        <Text>
          <Text style={shared.boldText}>Max channel size: </Text>
          {this.props.displaySatoshi(
            Math.round(this.state.graphInfo.max_channel_size)
          )}
        </Text>
      </View>
    );
  };

  render() {
    return (
      <View style={shared.container}>
        <Text style={shared.accountHeader}>Wallet operations</Text>
        {this._renderGraphSummary()}
        <View style={shared.separator} />
        {this._renderShowGraphNodes()}
        <View style={shared.separator} />
        {this._renderShowLogs()}
        <View style={shared.separator} />
        {this._renderShowAbout()}
      </View>
    );
  }
}

export default withLnd(ComponentWalletOperations);

const styles = StyleSheet.create({});
