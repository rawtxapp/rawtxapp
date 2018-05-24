import React, { Component, createContext } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { LIGHT_BLUE_500, LOGO_COLOR } from "./Colors";

const Theme = createContext({});

class ThemeProvider extends Component {
  constructor(props) {
    super(props);
    this.state = { dimmed: false, dimAnim: new Animated.Value(0) };
  }

  dimBackground = dim => {
    if (this.state.dimmed == dim) return;
    if (dim) {
      this.setState({ dimmed: dim });
    }
    Animated.timing(this.state.dimAnim, {
      toValue: dim ? 0.7 : 0,
      duration: 300,
      useNativeDriver: true
    }).start(() => {
      if (!dim) {
        this.setState({ dimmed: dim });
      }
    });
  };

  render() {
    return (
      <Theme.Provider
        value={{
          theme: defaultTheme,
          statusBar: "#0091EA",
          statusBarDark: "#616161",
          dimBackground: this.dimBackground
        }}
      >
        {this.props.children}
        <Animated.View
          style={[
            styles.dim,
            this.state.dimmed && styles.visible,
            { opacity: this.state.dimAnim }
          ]}
        />
      </Theme.Provider>
    );
  }
}

export default Theme.Consumer;
export { ThemeProvider };

const styles = StyleSheet.create({
  dim: {
    position: "absolute",
    top: 10000,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "black"
  },
  visible: {
    top: 0
  }
});

let themeColor = LIGHT_BLUE_500;
const defaultTheme = StyleSheet.create({
  button: {
    backgroundColor: "white"
  },
  buttonText: {
    color: themeColor
  },
  container: {
    backgroundColor: "white"
  },
  modal: {
    backgroundColor: "white",
    borderColor: "grey"
  },
  modalTitle: {
    color: "grey"
  },
  actionButton: {
    backgroundColor: LOGO_COLOR
  },
  actionButtonText: {
    color: "white"
  },
  separator: {
    borderTopWidth: 3 * StyleSheet.hairlineWidth,
    borderColor: "grey"
  },
  actionContainer: {
    backgroundColor: "#66BB6A",
    borderColor: "#43A047"
  },
  actionContainerText: {
    color: "white"
  }
});
