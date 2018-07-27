/* @flow */

import React, { Component } from "react";
import {
  Animated,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
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
      showUnlockAnim: new Animated.Value(0),
      showCreateAnim: new Animated.Value(0),
      showRemoteAnim: new Animated.Value(0),
      logoAnim: new Animated.Value(0)
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
      this.normalAnimCard(this.state.showUnlockAnim),
      this.normalAnimCard(this.state.showCreateAnim),
      this.normalAnimCard(this.state.showRemoteAnim)
    ]).start();
    Animated.spring(this.state.logoAnim, {
      toValue: 1,
      useNativeDriver: true
    }).start();
  };

  fullAnimCard = a => Animated.spring(a, { toValue: 2, useNativeDriver: true });
  removeAnimCard = a =>
    Animated.timing(a, { toValue: 0, useNativeDriver: true });
  normalAnimCard = a =>
    Animated.spring(a, { toValue: 1, useNativeDriver: true });

  showOnlyCard = a => {
    const r = this.state.showRemoteAnim,
      c = this.state.showCreateAnim,
      u = this.state.showUnlockAnim;
    let anims = [];
    a == r
      ? anims.unshift(this.fullAnimCard(a))
      : anims.push(this.removeAnimCard(r));
    a == c
      ? anims.unshift(this.fullAnimCard(a))
      : anims.push(this.removeAnimCard(c));
    a == u
      ? anims.unshift(this.fullAnimCard(a))
      : anims.push(this.removeAnimCard(u));
    Animated.stagger(100, anims).start();
  };

  hideAllCards = () => {
    Animated.stagger(100, [
      this.normalAnimCard(this.state.showRemoteAnim),
      this.normalAnimCard(this.state.showCreateAnim),
      this.normalAnimCard(this.state.showUnlockAnim)
    ]).start();
  };

  _renderCard = (onPress, icon, action, ix, color, anim, content) => {
    return (
      <Animated.View
        style={[
          styles.sheetCard,
          color,
          {
            transform: [
              {
                translateY: anim.interpolate({
                  inputRange: [0, 1, 2],
                  outputRange: [height, 150 * ix - 100, 0]
                })
              }
            ],
            zIndex: ix
          }
        ]}
      >
        <TouchableWithoutFeedback onPress={onPress}>
          <View style={[StyleSheet.absoluteFill]} />
        </TouchableWithoutFeedback>
        <TouchableWithoutFeedback onPress={onPress}>
          <Animated.View
            style={[
              styles.touchable,
              {
                transform: [
                  {
                    translateY: anim.interpolate({
                      inputRange: [1, 2],
                      outputRange: [50, 0]
                    })
                  }
                ]
              }
            ]}
          >
            <View style={styles.actionContainer}>
              <Animated.View
                style={[
                  styles.actionIcon,
                  {
                    transform: [
                      {
                        translateX: anim.interpolate({
                          inputRange: [1, 2],
                          outputRange: [30, 0]
                        })
                      }
                    ]
                  }
                ]}
              >
                <Image source={icon} style={styles.icon} />
              </Animated.View>
              <Animated.View
                style={[
                  styles.actionText,
                  {
                    transform: [
                      {
                        translateX: anim.interpolate({
                          inputRange: [1, 2],
                          outputRange: [30, 0]
                        })
                      }
                    ]
                  }
                ]}
              >
                <Text style={styles.sheetCardAction}>{action}</Text>
              </Animated.View>
              <TouchableWithoutFeedback onPress={this.hideAllCards}>
                <Animated.View
                  style={[
                    styles.actionIcon,
                    {
                      flex: 1,
                      opacity: anim.interpolate({
                        inputRange: [1, 2],
                        outputRange: [0, 1]
                      }),
                      transform: [
                        {
                          scaleX: anim.interpolate({
                            inputRange: [1, 2],
                            outputRange: [0, 1]
                          })
                        },
                        {
                          scaleY: anim.interpolate({
                            inputRange: [1, 2],
                            outputRange: [0, 1]
                          })
                        }
                      ]
                    }
                  ]}
                >
                  <Animated.Image
                    source={require("./assets/feather/close-2.png")}
                    style={{
                      width: 20,
                      height: 20,
                      tintColor: "white"
                    }}
                  />
                </Animated.View>
              </TouchableWithoutFeedback>
            </View>
          </Animated.View>
        </TouchableWithoutFeedback>
        <Animated.View
          style={{
            flex: 1,
            transform: [
              {
                translateY: anim.interpolate({
                  inputRange: [0, 1, 2],
                  outputRange: [0, 200, 0] // 0 : 150, 0.5 : 75, 1 : 0
                })
              }
            ]
          }}
        >
          {content}
        </Animated.View>
      </Animated.View>
    );
  };

  // This function helps animate cards away from the screen before calling
  // navigate.
  _navigate = screen => {
    Animated.parallel([
      this.removeAnimCard(this.state.showRemoteAnim),
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
        this.showOnlyCard(this.state.showUnlockAnim);
      },
      require("./assets/feather/unlock.png"),
      "Unlock",
      3,
      theme.unlockCard,
      this.state.showUnlockAnim,
      <ComponentUnlock
        navigation={this.props.navigation}
        navigate={this._navigate}
      />
    );
  };

  _renderCreate = () => {
    return this._renderCard(
      () => {
        this.showOnlyCard(this.state.showCreateAnim);
      },
      require("./assets/feather/add.png"),
      "Create",
      2,
      theme.createCard,
      this.state.showCreateAnim,
      <ComponentCreate />
    );
  };

  _renderRemote = () => {
    return this._renderCard(
      () => {
        this.showOnlyCard(this.state.showRemoteAnim);
      },
      require("./assets/feather/monitor-1.png"),
      "Remote",
      1,
      theme.remoteCard,
      this.state.showRemoteAnim,
      <Text>Test3</Text>
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
      <View style={styles.linearGradient}>
        <View style={styles.container}>
          {this._renderLogo()}
          <View style={styles.sheetContainer}>
            {this._renderRemote()}
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
    flex: 4,
    justifyContent: "flex-end",
    paddingTop: 40
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
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: "100%",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0
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
    justifyContent: "center",
    width: "100%"
  },
  icon: {
    width: 30,
    height: 30,
    tintColor: "white"
  }
});
