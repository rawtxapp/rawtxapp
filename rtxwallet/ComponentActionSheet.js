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
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import withTheme from "./withTheme";

var window = Dimensions.get("window");

class ButtonBase extends Component {
  render() {
    return (
      <TouchableOpacity
        style={[this.props.theme.actionButton, buttonStyles.button]}
        onPress={this.props.onPress}
      >
        <Text
          style={[this.props.theme.actionButtonText, buttonStyles.buttonText]}
        >
          {this.props.text}
        </Text>
      </TouchableOpacity>
    );
  }
}

const Button = withTheme(ButtonBase);

const buttonStyles = StyleSheet.create({
  buttonText: {
    alignSelf: "center",
    fontSize: 18
  },
  button: {
    height: 36,
    justifyContent: "center",
    alignSelf: "center",
    padding: 10,
    paddingHorizontal: 20,
    borderRadius: 6
  }
});

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
    this.props.dimBackground(newProps.visible);
  }

  render() {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={this.props.visible}
        onRequestClose={this.props.onRequestClose}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            onPress={this.props.onRequestClose}
            style={styles.backdropContainer}
          />
          <View style={{ flex: 1, justifyContent: "flex-end", paddingTop: 60 }}>
            <View style={[styles.modalTopContainer, this.props.theme.modal]}>
              <View style={styles.xContainer}>
                <TouchableOpacity onPress={this.props.onRequestClose}>
                  <Image
                    source={require("./assets/close.png")}
                    style={{ width: 20, height: 20 }}
                  />
                </TouchableOpacity>
              </View>
              <View style={styles.titleContainer}>
                <Text style={[styles.title, this.props.theme.modalTitle]}>
                  Payments
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
              onPress={this.props.onRequestClose}
              text={this.props.buttonText || "Cancel"}
            />
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
    padding: 10
  },
  sideBorder: {
    borderLeftWidth: 3 * StyleSheet.hairlineWidth,
    borderRightWidth: 3 * StyleSheet.hairlineWidth
  }
});
