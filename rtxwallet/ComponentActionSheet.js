import React, { Component } from "react";
import {
  ActivityIndicator,
  Animated,
  AppState,
  Dimensions,
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

class Button extends Component {
  render() {
    return (
      <TouchableOpacity
        style={buttonStyles.button}
        onPress={this.props.onPress}
      >
        <Text style={buttonStyles.buttonText}>{this.props.text}</Text>
      </TouchableOpacity>
    );
  }
}

const buttonStyles = StyleSheet.create({
  buttonText: {
    color: "#0069d5",
    alignSelf: "center",
    fontSize: 18
  },
  button: {
    height: 36,
    backgroundColor: "white",
    borderColor: "white",
    borderWidth: 1,
    borderRadius: 6,
    marginBottom: 10,
    marginTop: 10,
    alignSelf: "stretch",
    justifyContent: "center"
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
          <View style={{ flex: 1, justifyContent: "flex-end" }}>
            {this.props.children}
          </View>
          <Button
            onPress={this.props.onRequestClose}
            text={this.props.buttonText || "Cancel"}
          />
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
    padding: 8,
    paddingBottom: 0,
    justifyContent: "flex-end"
  },
  backdropContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  }
});
