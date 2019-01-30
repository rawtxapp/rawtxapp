/* @flow */

import React, { Component } from "react";
import {
  Animated,
  Dimensions,
  Image,
  LayoutAnimation,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View
} from "react-native";
import withTheme from "./withTheme";
import ComponentLogo from "./ComponentLogo";
import { styles as theme } from "react-native-theme";
import ComponentUnlock from "./ComponentUnlock";
import ComponentCreate from "./ComponentCreate";
import withLnd from "./withLnd";

import type { LndApi } from "./RestLnd";

const { height, width } = Dimensions.get("window");

type Props = {
  logoOnBackgroundColor?: string,
  theme: Object,
  unlockGradient: string[],
  createGradient: string[],
  remoteGradient: string[],
  navigation: Object,
  backgroundGradient: string[],
  getRunningWallet: void => Object,
  lndApi: LndApi
};
type State = {
  showUnlockAnim: Object,
  showCreateAnim: Object,
  showRemoteAnim: Object,
  logoAnim: Object
};

class ScreenIntro extends Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      logoAnim: new Animated.Value(0),
      showUnlockAnim: new Animated.Value(0),
      showCreateAnim: new Animated.Value(0),
      unlockedIx: -1
    };
  }

  componentDidMount() {
    if (this.props.navigation.getParam("showCardsImmediately", false) == true) {
      this.showIntro();
    } else {
      this.determineState();
    }
  }

  determineState = async () => {
    try {
      const running = await this.props.getRunningWallet();
      if (!running) {
        this.showIntro();
        return;
      }
    } catch (err) {}

    try {
      const lndState = await this.props.lndApi.determineState();
      if (lndState == "seed") {
        this.props.navigation.navigate("GenSeed");
      } else if (lndState == "unlocked") {
        this.props.navigation.navigate("Wallet");
      } else if (lndState == "password") {
        this.showOnlyCard(this.state.showUnlockAnim);
      }
      return;
    } catch (err) {}
  };

  showIntro = () => {
    Animated.stagger(200, [
      Animated.timing(this.state.showUnlockAnim, {
        toValue: 1,
        useNativeDriver: true
      }),
      Animated.timing(this.state.showCreateAnim, {
        toValue: 1,
        useNativeDriver: true
      })
    ]).start();
    Animated.spring(this.state.logoAnim, {
      toValue: 1,
      useNativeDriver: true
    }).start();
  };

  removeAnimCard = a =>
    Animated.timing(a, { toValue: 0, useNativeDriver: true });

  _renderCard = (onPress, icon, action, ix, color, content, anim) => {
    const sheetContainerHeight = height * 0.8;
    return (
      <Animated.View
        style={[
          styles.sheetCard,
          color,
          this.state.unlockedIx == ix && { flex: 2 },
          this.state.unlockedIx != ix &&
            this.state.unlockedIx != -1 && { flex: 0.3 },
          {
            transform: [
              {
                translateY: anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1000, 0]
                })
              }
            ]
          }
        ]}
      >
        <TouchableWithoutFeedback onPress={onPress} accessible={false}>
          <View style={[StyleSheet.absoluteFill]} />
        </TouchableWithoutFeedback>
        <TouchableWithoutFeedback onPress={onPress} accessible={false}>
          <View
            style={[
              styles.touchable,
              this.state.unlockedIx != ix && { width: "100%", height: "100%" }
            ]}
          >
            <View style={styles.actionContainer}>
              <View style={[styles.actionIcon]}>
                <Image source={icon} style={styles.icon} />
              </View>
              <View style={[styles.actionText]}>
                <Text style={styles.sheetCardAction}>{action}</Text>
              </View>
              <TouchableWithoutFeedback
                onPress={() => {
                  LayoutAnimation.easeInEaseOut();
                  this.setState({ unlockedIx: -1 });
                }}
                accessible={false}
              >
                <View
                  style={[
                    styles.actionIcon,
                    { flex: 0.5, opacity: 0 },
                    this.state.unlockedIx == ix && {
                      flex: 1,
                      opacity: 1
                    }
                  ]}
                >
                  <Image
                    source={require("../assets/feather/close-2.png")}
                    style={{
                      width: 20,
                      height: 20,
                      tintColor: "white"
                    }}
                  />
                </View>
              </TouchableWithoutFeedback>
            </View>
          </View>
        </TouchableWithoutFeedback>
        <View
          style={{
            flex: 1
          }}
        >
          {this.state.unlockedIx == ix && content}
        </View>
      </Animated.View>
    );
  };

  // This function helps animate cards away from the screen before calling
  // navigate.
  _navigate = screen => {
    Animated.parallel([
      this.removeAnimCard(this.state.showCreateAnim),
      this.removeAnimCard(this.state.showUnlockAnim),
      this.removeAnimCard(this.state.logoAnim)
    ]).start(() => {
      this.props.navigation.navigate(screen);
    });
  };

  _renderUnlock = () => {
    return this._renderCard(
      () => {
        // this.showOnlyCard(this.state.showUnlockAnim);
        LayoutAnimation.easeInEaseOut();
        this.setState({ unlockedIx: 1 });
      },
      require("../assets/feather/unlock.png"),
      "Unlock",
      1,
      theme.unlockCard,
      <ComponentUnlock
        navigation={this.props.navigation}
        navigate={this._navigate}
      />,
      this.state.showUnlockAnim
    );
  };

  _renderCreate = () => {
    return this._renderCard(
      () => {
        LayoutAnimation.easeInEaseOut();
        this.setState({ unlockedIx: 0 });
      },
      require("../assets/feather/add.png"),
      "Create",
      0,
      theme.createCard,
      <ComponentCreate navigate={this._navigate} />,
      this.state.showCreateAnim
    );
  };

  _renderLogo = () => {
    return (
      <Animated.View
        style={{
          flex: 1,
          transform: [
            {
              translateY: this.state.logoAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-300, 0]
              })
            }
          ]
        }}
      >
        <ComponentLogo imageStyles={theme.logoOnLightBackground} />
      </Animated.View>
    );
  };

  render() {
    return (
      <View style={[styles.linearGradient, theme.appBackground]}>
        <View style={styles.container}>
          {this._renderLogo()}
          <View style={styles.sheetContainer}>
            <View
              style={[{ flex: 0 }, this.state.unlockedIx == -1 && { flex: 2 }]}
            />
            {this._renderCreate()}
            {this._renderUnlock()}
          </View>
        </View>
      </View>
    );
  }
}

export default withLnd(withTheme(ScreenIntro));

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20
  },
  linearGradient: {
    flex: 1
  },
  sheetContainer: {
    flex: 4
  },
  actionContainer: {
    flexDirection: "row"
  },
  actionIcon: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden"
  },
  sheetCard: {
    borderRadius: 20,
    overflow: "hidden",
    flex: 1,
    margin: 20,
    marginVertical: 10
  },
  sheetCardAction: {
    fontSize: 36,
    color: "white"
  },
  actionText: {
    flex: 1,
    alignItems: "center"
  },
  touchable: {
    alignItems: "center",
    justifyContent: "center"
  },
  icon: {
    width: 30,
    height: 30,
    tintColor: "white"
  }
});
