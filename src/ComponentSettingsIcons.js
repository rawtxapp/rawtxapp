import React, { Component } from "react";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import ComponentActionSheet from "./ComponentActionSheet";
import ScreenSettings from "./ScreenSettings";

class ComponentSettingsIcon extends Component {
  constructor(props) {
    super(props);
    this.state = { showingSettings: false };
    this.modalRef = React.createRef();
  }

  _renderSettings = () => {
    const closeModal = () => this.setState({ showingSettings: false });
    return (
      <ComponentActionSheet
        visible={!!this.state.showingSettings}
        onRequestClose={closeModal}
        animationType="slide"
        buttonText="Done"
        title="Settings"
        ref={this.modalRef}
      >
        {this.props.screenFn &&
          this.props.screenFn(() => this.modalRef.current.close())}
      </ComponentActionSheet>
    );
  };

  render() {
    return (
      <View>
        <TouchableOpacity
          onPress={() => this.setState({ showingSettings: true })}
        >
          <View>
            <Image
              source={require("../assets/feather/settings.png")}
              style={styles.settingsIcon}
            />
            {this.props.showYellowIndicator && (
              <View style={styles.indicator} />
            )}
          </View>
        </TouchableOpacity>
        {this._renderSettings()}
      </View>
    );
  }
}

export default ComponentSettingsIcon;

const styles = StyleSheet.create({
  settingsIcon: {
    width: 26,
    height: 26
  },
  indicator: {
    backgroundColor: "orange",
    position: "absolute",
    top: -3,
    right: -3,
    width: 10,
    height: 10,
    borderRadius: 5
  }
});
