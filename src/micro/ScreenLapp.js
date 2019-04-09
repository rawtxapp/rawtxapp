import React, { Component } from "react";
import {
  Animated,
  BackHandler,
  Dimensions,
  Image,
  Platform,
  StyleSheet,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
  WebView
} from "react-native";
import withLnd from "../withLnd";
import { styles as theme } from "react-native-theme";
import { MicroProvider } from "./ContextMicro";
import ComponentWebview from "./ComponentWebview";
import ComponentAllowanceStatus from "./ComponentAllowanceStatus";
import ComponentActionSheet from "../ComponentActionSheet";
import ComponentAllowance from "./ComponentAllowance";

const { height } = Dimensions.get("screen");

class ScreenLapp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showAnim: new Animated.Value(0)
    };
  }

  componentDidMount() {
    this.backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      this.goToWallet
    );

    this.animateShowAnim(1);
  }

  animateShowAnim = (toValue, callback) => {
    Animated.spring(this.state.showAnim, {
      toValue,
      useNativeDriver: true,
      friction: 10,
      tension: 20
    }).start(callback);
  };

  goToWallet = () => {
    this.animateShowAnim(0, () => this.props.navigation.navigate("Wallet"));
    return true;
  };

  componentWillUnmount() {
    this.backHandler.remove();
  }

  _renderAllowance = () => {
    return (
      <ComponentActionSheet
        visible={!!this.state.showingAllowance}
        onRequestClose={() => this.setState({ showingAllowance: false })}
        animationType="slide"
        buttonText="Done"
        title="Allowance"
      >
        <ComponentAllowance />
      </ComponentActionSheet>
    );
  };

  render() {
    const lapp = this.props.navigation.getParam("lapp");
    return (
      <MicroProvider lapp={lapp}>
        <View
          style={[
            styles.container,
            theme.appBackground,
            lapp.themeColor && { backgroundColor: lapp.themeColor }
          ]}
        >
          <Animated.View
            style={[
              styles.statusContainer,
              {
                opacity: this.state.showAnim,
                transform: [
                  {
                    translateY: this.state.showAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-100, 0]
                    })
                  }
                ]
              }
            ]}
          >
            <Image source={{ uri: lapp.icon }} style={styles.icon} />
            <Text>{lapp.name}</Text>
            <View style={styles.statusMicroContainer}>
              <TouchableOpacity
                onPress={() => this.setState({ showingAllowance: true })}
                style={styles.allowanceContainer}
              >
                <ComponentAllowanceStatus />
              </TouchableOpacity>
              <TouchableOpacity onPress={this.goToWallet}>
                <Image
                  source={require("../../assets/close.png")}
                  style={styles.icon}
                />
              </TouchableOpacity>
            </View>
          </Animated.View>
          <Animated.View
            style={[
              styles.webview,
              {
                opacity: this.state.showAnim,
                transform: [
                  {
                    translateY: this.state.showAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [height, 0]
                    })
                  }
                ]
              }
            ]}
          >
            <ComponentWebview />
          </Animated.View>
          {this._renderAllowance()}
        </View>
      </MicroProvider>
    );
  }
}

export default ScreenLapp;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS == "ios" ? 20 : StatusBar.currentHeight
  },
  allowanceContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginRight: 10
  },
  webview: {
    flex: 1
  },
  statusContainer: {
    paddingHorizontal: 5,
    paddingBottom: 2,
    flexDirection: "row",
    alignItems: "center"
  },
  statusMicroContainer: {
    flex: 1,
    flexDirection: "row"
  },
  icon: {
    width: 28,
    height: 28,
    marginRight: 4
  }
});
