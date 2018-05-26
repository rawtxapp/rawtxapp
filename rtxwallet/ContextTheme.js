import React, { Component, createContext } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { LIGHT_BLUE_500, LOGO_COLOR } from "./Colors";
import theme from "react-native-theme";

const Theme = createContext({});

class ThemeProvider extends Component {
  constructor(props) {
    super(props);
    this.state = { dimmed: false, dimAnim: new Animated.Value(0) };
  }

  componentDidMount() {
    theme.setRoot(this);
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
          dimBackground: this.dimBackground,
          logoOnBackgroundColor: "white"
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
// DEPRECATED, use the theme.add below.
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
  containerText: {
    color: "black"
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
    borderTopWidth: 2 * StyleSheet.hairlineWidth,
    borderColor: "grey"
  },
  actionContainer: {
    backgroundColor: "white"
  },
  actionContainerText: {},
  appBackground: {
    backgroundColor: themeColor
  },
  textOnBackground: {
    color: "white"
  }
});

theme.add({
  container: {
    borderRadius: 10,
    backgroundColor: "white",
    padding: 10,
    margin: 10,
    marginLeft: 20,
    marginRight: 20
  },
  containerStyleOnly: {
    borderRadius: 10,
    backgroundColor: "white"
  },
  flexOne: {
    flex: 1
  },
  flexTwo: {
    flex: 2
  },
  flexThree: {
    flex: 3
  },
  flexZero: {
    flex: 0
  },
  noPadding: {
    padding: 0
  },
  flexRow: {
    flexDirection: "row"
  },
  inCardButton: {
    padding: 4,
    margin: 4,
    color: LOGO_COLOR,
    fontSize: 16
  },
  smallButton: {
    color: LOGO_COLOR,
    fontSize: 14
  },
  textAlignLeft: {
    textAlign: "left"
  },
  centerPrimaryAxis: {
    justifyContent: "center"
  },
  centerSecondaryAxis: {
    alignItems: "center"
  },
  accountHeader: {
    fontSize: 16,
    color: LOGO_COLOR,
    fontWeight: "bold"
  },
  smallerHeader: {
    fontSize: 14,
    color: LOGO_COLOR,
    fontWeight: "bold"
  },
  headerText: {
    fontSize: 16,
    fontWeight: "bold"
  },
  explanationText: {
    fontSize: 14
  },
  textInput: {
    backgroundColor: "white",
    borderRadius: 10,
    margin: 10,
    flex: 1,
    padding: 10
  },
  selectableText: {
    borderRadius: 10,
    borderWidth: 2,
    borderColor: LOGO_COLOR,
    margin: 10,
    padding: 10,
    fontSize: 14
  },
  textInput: {
    borderRadius: 10,
    borderWidth: 2,
    borderColor: LOGO_COLOR,
    margin: 10,
    padding: 10,
    fontSize: 14
  },
  baseText: {
    fontSize: 14
  },
  errorText: {
    fontSize: 12,
    color: "red"
  },
  separator: {
    borderBottomWidth: 1,
    borderColor: "#BDBDBD",
    margin: 5,
    marginLeft: -10,
    marginRight: -10
  },
  cancelButton: {
    color: "red"
  },
  boldText: {
    fontWeight: "bold"
  },
  greenButton: {
    color: "green"
  },
  warningText: {
    fontSize: 12,
    color: "orange"
  },
  disabledButton: {
    color: "gray"
  },
  successText: {
    fontSize: 12,
    color: "green"
  },
  successTextColorOnly: {
    color: "green"
  }
});
