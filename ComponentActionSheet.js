import React, { Component } from "react";
import {
  ActivityIndicator,
  Animated,
  AppState,
  Dimensions,
  Image,
  LayoutAnimation,
  Linking,
  Modal,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import withTheme from "./withTheme";
import Button from "react-native-button";
import { styles as theme } from "react-native-theme";
import KeyboardSpacer from "react-native-keyboard-spacer";
import withLnd from "./withLnd";

var window = Dimensions.get("window");

class ActionModal extends Component {
  state = {};
  componentWillReceiveProps(newProps) {
    if (newProps.visible) {
      this.props.dimBackground(true);
      this.props.setActionSheetMethods(
        callback => this.setState({ hidden: true }, callback),
        callback => this.setState({ hidden: false }, callback)
      );
    }
  }

  render() {
    const close = () => {
      this.props.onRequestClose();
      this.props.dimBackground(false);
      this.props.clearActionSheetMethods();
    };
    const visible = this.props.visible && !this.state.hidden;
    return (
      <View>
        <Modal
          animationType="slide"
          transparent={true}
          visible={visible}
          onRequestClose={close}
        >
          {visible && <StatusBar backgroundColor={this.props.statusBarDark} />}
          <View style={styles.modalContainer}>
            <TouchableOpacity
              onPress={close}
              style={styles.backdropContainer}
            />
            <View style={styles.modalSpacer}>
              <View style={[styles.modalTopContainer, this.props.theme.modal]}>
                <View style={styles.xContainer}>
                  <TouchableOpacity onPress={close}>
                    <Image
                      source={require("./assets/close.png")}
                      style={styles.closeButton}
                    />
                  </TouchableOpacity>
                </View>
                <View style={styles.titleContainer}>
                  <Text style={[styles.title, this.props.theme.modalTitle]}>
                    {this.props.title}
                  </Text>
                </View>
                <View style={styles.rightActionContainer} />
              </View>
              <View style={this.props.theme.separator} />
              <View style={[this.props.theme.modal, styles.sideBorder]}>
                {this.props.children}
                {Platform.OS == "ios" && <KeyboardSpacer />}
              </View>
            </View>
            <View style={this.props.theme.separator} />
            <View
              style={[
                styles.actionContainer,
                styles.sideBorder,
                this.props.theme.modal
              ]}
            >
              <Button
                onPress={close}
                style={[theme.actionButton, styles.actionButton]}
              >
                {this.props.buttonText || "Done"}
              </Button>
            </View>
          </View>
        </Modal>
      </View>
    );
  }
}

export default withLnd(withTheme(ActionModal));

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
    padding: 5,
    margin: 5
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
    borderWidth: StyleSheet.hairlineWidth * 3,
    borderBottomWidth: 0,
    padding: 10,
    flexDirection: "row"
  },
  xContainer: {
    flex: 1
  },
  titleContainer: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1
  },
  title: {
    fontWeight: "bold"
  },
  rightActionContainer: {
    flex: 1
  },
  backdropContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },
  actionContainer: {
    padding: 5
  },
  sideBorder: {
    borderLeftWidth: 3 * StyleSheet.hairlineWidth,
    borderRightWidth: 3 * StyleSheet.hairlineWidth
  }
});
