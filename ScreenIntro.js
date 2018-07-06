/* @flow */

import React, { Component } from "react";
import {
  Animated,
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
  showingUnlock: boolean,
  showingCreate: boolean,
  showingRemote: boolean
};

class ScreenIntro extends Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      showUnlockAnim: new Animated.Value(0),
      showCreateAnim: new Animated.Value(0),
      showRemoteAnim: new Animated.Value(0),

      showingUnlock: false,
      showingCreate: false,
      showingRemote: false
    };
  }

  componentDidMount() {
    this.determineState();
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
  };

  fullAnimCard = a => Animated.timing(a, { toValue: 2, duration: 500 });
  removeAnimCard = a => Animated.timing(a, { toValue: 0, duration: 500 });
  normalAnimCard = a => Animated.timing(a, { toValue: 1, duration: 500 });

  showOnlyCard = (s, a) => {
    const r = this.state.showRemoteAnim,
      c = this.state.showCreateAnim,
      u = this.state.showUnlockAnim;
    this.setState(s, () => {
      Animated.stagger(200, [
        a == r ? this.fullAnimCard(a) : this.removeAnimCard(r),
        a == c ? this.fullAnimCard(a) : this.removeAnimCard(c),
        a == u ? this.fullAnimCard(a) : this.removeAnimCard(u)
      ]).start();
    });
  };

  hideAllCards = () => {
    Animated.stagger(200, [
      this.normalAnimCard(this.state.showRemoteAnim),
      this.normalAnimCard(this.state.showCreateAnim),
      this.normalAnimCard(this.state.showUnlockAnim)
    ]).start(() => {
      this.setState({
        showingUnlock: false,
        showingCreate: false,
        showingRemote: false
      });
    });
  };

  _renderCard = (
    onPress,
    icon,
    action,
    ix,
    gradient,
    anim,
    showContent,
    content
  ) => {
    return (
      <Animated.View
        style={[
          styles.sheetCard,
          ix && {
            height: anim.interpolate({
              inputRange: [0, 1, 2],
              outputRange: ["0%", 30 * ix + "%", "100%"]
            })
          }
        ]}
      >
        <LinearGradient
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          colors={gradient}
          style={theme.absoluteSheetCard}
        />
        <TouchableWithoutFeedback onPress={onPress}>
          <Animated.View
            style={[
              styles.touchable,
              {
                height: anim.interpolate({
                  inputRange: [1, 2],
                  outputRange: [100 / ix + "%", "15%"]
                })
              }
            ]}
          >
            <View style={styles.actionContainer}>
              <View style={styles.actionIcon}>
                <Image source={icon} style={styles.icon} />
              </View>
              <Animated.View
                style={[
                  styles.actionText,
                  {
                    marginRight: anim.interpolate({
                      inputRange: [1, 2],
                      outputRange: [50, 0]
                    })
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
                      flex: anim.interpolate({
                        inputRange: [1, 2],
                        outputRange: [0, 1]
                      })
                    }
                  ]}
                >
                  <Animated.Image
                    source={require("./assets/feather/close-2.png")}
                    style={{
                      width: anim.interpolate({
                        inputRange: [1, 2],
                        outputRange: [0, 20]
                      }),
                      height: anim.interpolate({
                        inputRange: [1, 2],
                        outputRange: [0, 20]
                      }),
                      tintColor: "white"
                    }}
                  />
                </Animated.View>
              </TouchableWithoutFeedback>
            </View>
          </Animated.View>
        </TouchableWithoutFeedback>
        {showContent && content}
      </Animated.View>
    );
  };

  _renderUnlock = () => {
    return this._renderCard(
      () => {
        this.showOnlyCard({ showingUnlock: true }, this.state.showUnlockAnim);
      },
      require("./assets/feather/unlock.png"),
      "Unlock",
      1,
      this.props.unlockGradient,
      this.state.showUnlockAnim,
      this.state.showingUnlock,
      <ComponentUnlock navigation={this.props.navigation} />
    );
  };

  _renderCreate = () => {
    return this._renderCard(
      () => {
        this.showOnlyCard({ showingCreate: true }, this.state.showCreateAnim);
      },
      require("./assets/feather/add.png"),
      "Create",
      2,
      this.props.createGradient,
      this.state.showCreateAnim,
      this.state.showingCreate,
      <ComponentCreate />
    );
  };

  _renderRemote = () => {
    return this._renderCard(
      () => {
        this.showOnlyCard({ showingRemote: true }, this.state.showRemoteAnim);
      },
      require("./assets/feather/monitor-1.png"),
      "Remote",
      3,
      this.props.remoteGradient,
      this.state.showRemoteAnim,
      this.state.showingRemote,
      <Text>Test3</Text>
    );
  };

  render() {
    return (
      <View style={styles.linearGradient}>
        <LinearGradient
          start={{ x: 0.0, y: 0 }}
          end={{ x: 1, y: 0.7 }}
          locations={[0, 1]}
          colors={this.props.backgroundGradient}
          style={theme.absoluteFill}
        />
        <View style={styles.container}>
          <ComponentLogo />
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
    height: "20%",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    overflow: "hidden"
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
