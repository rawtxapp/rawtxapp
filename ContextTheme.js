import React, { Component, createContext } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { LIGHT_BLUE_500, LOGO_COLOR, LIGHT_BLUE_200 } from "./Colors";
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
          statusBar: "#78909C",
          statusBarDark: "#263238",
          dimBackground: this.dimBackground,
          logoOnBackgroundColor: "#37474F",
          spinnerOnBackgroundColor: "#37474F"
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
    backgroundColor: "#ECEFF1"
  },
  textOnBackground: {
    color: "#37474F"
  }
});

// TODO: Find a better name.
const buttonBaseBase = {
  backgroundColor: "#29B6F6",
  borderRadius: 10,
  padding: 10,
  margin: 5,
  overflow: "hidden"
};

const buttonBase = {
  ...buttonBaseBase,
  color: "white",
  borderWidth: 2,
  borderColor: themeColor
};

theme.add({
  appBackground: {
    backgroundColor: "#ECEFF1"
  },
  container: {
    borderRadius: 10,
    backgroundColor: "white",
    padding: 10,
    margin: 10,
    marginLeft: 20,
    marginRight: 20,
    elevation: 1,
    ios: {
      shadowOpacity: 0.0015 + 0.18,
      shadowRadius: 0.54,
      shadowOffset: {
        height: 0.6
      }
    }
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
  headerText: {
    fontSize: 16,
    fontWeight: "bold"
  },
  explanationText: {
    fontSize: 14
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
    backgroundColor: "white",
    borderRadius: 10,
    borderWidth: 2,
    margin: 10,
    padding: 10,
    fontSize: 14,
    borderColor: "#9E9E9E"
  },
  textInputSuccess: {
    borderColor: "#43A047"
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
    color: "#4CAF50"
  },
  errorTextColorOnly: {
    color: "#F44336"
  },
  actionButton: {
    ...buttonBase
  },
  smallActionButton: {
    ...buttonBaseBase,
    padding: 5,
    flex: 1
  },
  smallActionButtonText: {
    color: "white"
  },
  activeActionButton: {
    ...buttonBase,
    color: themeColor,
    backgroundColor: "white",
    borderColor: themeColor
  },
  errorActionButton: {
    ...buttonBase,
    color: "#F44336",
    backgroundColor: "white",
    borderColor: "#F44336"
  },
  errorActionButtonFull: {
    ...buttonBase,
    color: "white",
    backgroundColor: "#F44336",
    borderColor: "#F44336"
  },
  successActionButton: {
    ...buttonBase,
    color: "#4CAF50",
    backgroundColor: "white",
    borderColor: "#4CAF50"
  },
  channelStatusActiveContainer: {
    ...buttonBaseBase,
    backgroundColor: "white",
    borderWidth: 2,
    borderColor: "#4CAF50"
  },
  channelStatusInactiveContainer: {
    ...buttonBaseBase,
    backgroundColor: "white",
    borderWidth: 2,
    borderColor: "#F44336"
  },
  localBalanceBar: {
    backgroundColor: "#4CAF50"
  },
  remoteBalanceBar: {
    backgroundColor: "#FF9800"
  },
  infoLabel: {
    fontSize: 20,
    color: "#37474F"
  },
  smallInfoLabel: {
    fontSize: 18,
    color: "#37474F"
  },
  infoValue: {
    fontSize: 16,
    color: "#37474F"
  },
  accountHeader: {
    fontSize: 20,
    color: "#37474F",
    fontWeight: "bold"
  },
  smallerHeader: {
    fontSize: 14,
    color: "#37474F",
    fontWeight: "bold"
  }
});
