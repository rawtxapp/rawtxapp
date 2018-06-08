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

var window = Dimensions.get("window");

class FadeInView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fadeAnim: new Animated.Value(0)
    };
  }

  componentDidMount() {
    this._animate(this.props);
  }

  componentWillReceiveProps(newProps) {
    this._animate(newProps);
  }

  _animate(newProps) {
    return Animated.timing(this.state.fadeAnim, {
      toValue: newProps.visible ? 0.7 : 0,
      duration: 300
    }).start();
  }

  render() {
    return (
      <Animated.View
        style={[
          fadeInStyles.overlay,
          this.props.visible && fadeInStyles.visible,
          { opacity: this.state.fadeAnim },
          { backgroundColor: this.props.backgroundColor || "black" }
        ]}
      >
        {this.props.children}
      </Animated.View>
    );
  }
}

const fadeInStyles = StyleSheet.create({
  overlay: {
    top: window.height,
    bottom: 0,
    left: 0,
    right: 0,
    height: window.height,
    width: window.width,
    position: "absolute"
  },
  visible: {
    top: 0
  }
});

class ActionModal extends Component {
  componentWillReceiveProps(newProps) {
    if (newProps.visible) {
      this.props.dimBackground(true);
    }
  }

  render() {
    const close = () => {
      this.props.onRequestClose();
      this.props.dimBackground(false);
    };
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={this.props.visible}
        onRequestClose={close}
      >
        {this.props.visible && (
          <StatusBar backgroundColor={this.props.statusBarDark} />
        )}
        <View style={styles.modalContainer}>
          <TouchableOpacity onPress={close} style={styles.backdropContainer} />
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
    );
  }
}

export default withTheme(ActionModal);

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
