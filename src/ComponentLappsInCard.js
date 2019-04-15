import React, { Component } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  View
} from "react-native";
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
      <ScrollView contentContainerStyle={styles.container} horizontal={true}>
        <Text style={styles.lappsText}>apps</Text>
        {this.state.lapps.map(this._renderLapp)}
      </ScrollView>
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
    alignItems: "center"
  },
  lappContainer: {
    alignItems: "center",
    marginHorizontal: 5
  },
  lappIcon: {
    width: undefined,
    height: 32,
    aspectRatio: 1,
    borderRadius: 10000,
    overflow: "hidden"
  },
  lappsText: {
    fontSize: 18,
    marginRight: 10
  }
});
