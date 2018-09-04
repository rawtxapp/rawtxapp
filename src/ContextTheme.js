import React, { Component, createContext } from "react";
import { Animated, Dimensions, StyleSheet, View } from "react-native";
import { LIGHT_BLUE_500, LOGO_COLOR, LIGHT_BLUE_200 } from "./Colors";
import theme from "react-native-theme";

const Theme = createContext({});

const { height, width } = Dimensions.get("screen");

class ThemeProvider extends Component {
  constructor(props) {
    super(props);
    this.state = { dimmed: false, dimAnim: new Animated.Value(0) };
  }

  componentDidMount() {
    theme.setRoot(this);
  }

  dimBackground = dim => {
    Animated.timing(this.state.dimAnim, {
      toValue: dim ? 0.7 : 0,
      duration: 300,
      useNativeDriver: true
    }).start(() => {});
  };

  render() {
    return (
      <Theme.Provider
        value={{
          theme: defaultTheme,
          statusBar: "#78909C",
          statusBarDark: "#263238",
          dimBackground: this.dimBackground,
          logoOnBackgroundColor: "white",
          spinnerOnBackgroundColor: "#37474F",
          backgroundGradient: ["#083f67", "#3490b6"],
          createGradient: ["#FF8008", "#FFC837"],
          remoteGradient: ["#fa4d5c", "#fc97a0"],
          unlockGradient: ["#a168a5", "#787baf"]
        }}
      >
        {this.props.children}
        <Animated.View
          style={[
            styles.dim,
            {
              opacity: this.state.dimAnim,
              transform: [
                {
                  scaleX: this.state.dimAnim.interpolate({
                    inputRange: [0, 0.01],
                    outputRange: [0.005, width]
                  })
                },
                {
                  scaleY: this.state.dimAnim.interpolate({
                    inputRange: [0, 0.01],
                    outputRange: [0.005, width]
                  })
                }
              ]
            }
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
    top: 0,
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
  padding: 8,
  margin: 5,
  overflow: "hidden"
};

const buttonBase = {
  ...buttonBaseBase,
  color: "white",
  borderWidth: 2,
  borderColor: "#29B6F6"
};

theme.add({
  appBackground: {
    backgroundColor: "#ECEFF1"
  },
  container: {
    borderRadius: 10,
    backgroundColor: "white",
    overflow: "hidden",
    padding: 10,
    margin: 10,
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
    color: "#37474F",
    fontWeight: "normal"
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
  },
  logoImage: {
    width: undefined,
    height: 80,
    resizeMode: "contain",
    tintColor: "white"
  },
  absoluteSheetCard: {
    width: "100%",
    height: "100%",
    position: "absolute",

    borderTopLeftRadius: 20,
    borderTopRightRadius: 20
  },
  absoluteFill: {
    position: "absolute",
    width: "100%",
    height: "100%"
  },
  logoOnLightBackground: {
    tintColor: "#37474F"
  },
  unlockCard: {
    backgroundColor: "#A1B235"
  },
  createCard: {
    backgroundColor: "#358AB2"
  },
  remoteCard: {
    backgroundColor: "#586C75"
  },
  sendButton: {
    backgroundColor: LIGHT_BLUE_500
  },
  receiveButton: {
    backgroundColor: "#8BC34A"
  },
  cardBottomActionButton: {
    backgroundColor: "#CFD8DC",
    flex: 1,
    margin: -10,
    padding: 10,
    borderColor: "#37474F"
  },
  statusBarBackground: {
    backgroundColor: "#78909C"
  },
  statusBarText: {
    color: "white"
  }
});
