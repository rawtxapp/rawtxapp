import React, { Component } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import withLnd from "./withLnd";
import Micro from "./micro/Micro";

class ComponentLappsInCard extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    this.getLapps();
  }

  getLapps = async () => {
    try {
      const wallet = await this.props.getRunningWallet();
      const lapps = await Micro.getLapps(wallet.coin, wallet.network);
      if (!lapps || lapps.length == 0) return;
      this.setState({ lapps });
    } catch (err) {}
  };

  _renderLapp = (lapp, i) => {
    return (
      <TouchableOpacity
        key={i}
        onPress={() => {
          this.props.navigate("Lapp", { lapp });
        }}
      >
        <View style={styles.lappContainer}>
          <Image source={{ uri: lapp.icon }} style={styles.lappIcon} />
          <Text>{lapp.name}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  _renderLapps = () => {
    if (!this.state.lapps) return;
    return (
      <View style={styles.container}>
        <Text style={styles.lappsText}>apps</Text>
        {this.state.lapps.map(this._renderLapp)}
      </View>
    );
  };

  render() {
    return <View>{this._renderLapps()}</View>;
  }
}

export default withLnd(ComponentLappsInCard);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: 5,
    alignItems: "center",
    borderTopWidth: 1,
    borderColor: "#E0E0E0",
    marginHorizontal: -10
  },
  lappContainer: {
    alignItems: "center",
    marginHorizontal: 5
  },
  lappIcon: {
    width: 32,
    height: 32
  },
  lappsText: {
    fontSize: 18,
    marginRight: 10
  }
});
