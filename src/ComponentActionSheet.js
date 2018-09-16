import React, { Component } from "react";
import {
  ActivityIndicator,
  Animated,
  AppState,
  Dimensions,
  Image,
  InteractionManager,
  LayoutAnimation,
  Linking,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import withTheme, { withThemeRef } from "./withTheme";
import Button from "react-native-button";
import { styles as theme } from "react-native-theme";
import KeyboardSpacer from "react-native-keyboard-spacer";
import withLnd, { withLndRef } from "./withLnd";

var window = Dimensions.get("window");

class ActionModal extends Component {
  state = {};
  componentWillReceiveProps(newProps) {
    if (newProps.visible) {
      this.props.dimBackground(true);
      InteractionManager.runAfterInteractions(() => {
        this.props.setActionSheetMethods(
          callback => this.setState({ hidden: true }, callback),
          callback => this.setState({ hidden: false }, callback)
        );
      });
    }
  }

  close = () => {
    this.props.onRequestClose();
    this.props.dimBackground(false);
    this.props.clearActionSheetMethods();
  };

  render() {
    const visible = this.props.visible && !this.state.hidden;
    return (
      <View>
        <Modal
          animationType="slide"
          transparent={true}
          visible={visible}
          onRequestClose={this.close}
        >
          <View style={styles.modalContainer}>
            <TouchableOpacity
              onPress={this.close}
              style={styles.backdropContainer}
            />
            <View style={styles.modalSpacer}>
              <View style={[styles.modalTopContainer, this.props.theme.modal]}>
                <View style={styles.leftActionContainer} />
                <View style={styles.titleContainer}>
                  <Text style={[styles.title, this.props.theme.modalTitle]}>
                    {this.props.title}
                  </Text>
                </View>
                <View style={styles.xContainer}>
                  <TouchableOpacity onPress={this.close}>
                    <Image
                      source={require("../assets/close.png")}
                      style={styles.closeButton}
                    />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={[this.props.theme.modal]}>
                {this.props.children}
                {Platform.OS == "ios" && <KeyboardSpacer />}
              </View>
            </View>
            <View style={[styles.actionContainer, this.props.theme.modal]}>
              <TouchableOpacity onPress={this.close}>
                <View style={[styles.actionButton]}>
                  <Text style={styles.actionText}>
                    {this.props.buttonText || "Done"}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    );
  }
}

export default withLndRef(withThemeRef(ActionModal));

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "red"
  },
  closeButton: {
    width: 20,
    height: 20
  },
  actionButton: {
    backgroundColor: "#CFD8DC",
    alignItems: "center",
    padding: 10,
    marginTop: 10
  },
  actionText: {
    color: "#37474F",
    fontSize: 18
  },
  modalSpacer: {
    flex: 1,
    justifyContent: "flex-end",
    paddingTop: 60
  },
  modalContainer: {
    flex: 1,
    paddingBottom: 0,
    justifyContent: "flex-end"
  },
  modalTopContainer: {
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    backgroundColor: "white",
    padding: 10,
    flexDirection: "row"
  },
  xContainer: {
    flex: 1,
    alignItems: "flex-end",
    marginRight: 10
  },
  titleContainer: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1
  },
  title: {
    fontWeight: "bold"
  },
  leftActionContainer: {
    flex: 1
  },
  backdropContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },
  actionContainer: {},
  sideBorder: {
    borderLeftWidth: 3 * StyleSheet.hairlineWidth,
    borderRightWidth: 3 * StyleSheet.hairlineWidth
  }
});
