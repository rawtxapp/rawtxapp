/* @flow */

import React, { Component } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import withTheme from "./withTheme";
import { styles as theme } from "react-native-theme";

import { Transition } from "react-navigation-fluid-transitions";
import ComponentLogo from "./ComponentLogo";
import ComponentUnlock from "./ComponentUnlock";

type Props = {
  logoOnBackgroundColor?: string,
  theme: Object,
  unlockGradient: Array<String>,
  backgroundGradient: Array<String>,
  navigation: Object
};
type State = {};
class ScreenUnlock extends Component<Props, State> {
  _renderContent = () => {
    return (
      <Transition appear="bottom" delay>
        <ScrollView style={styles.contentContainer}>
          <ComponentUnlock navigation={this.props.navigation} />
        </ScrollView>
      </Transition>
    );
  };

  _renderUnlock = () => {
    return (
      <View style={styles.sheetCard}>
        <Transition shared="sheet">
          <LinearGradient
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            colors={this.props.unlockGradient}
            style={theme.absoluteSheetCard}
          />
        </Transition>
        <View style={styles.actionContainer}>
          <View style={styles.actionIcon}>
            <Transition shared="icon">
              <Image
                source={require("./assets/feather/unlock.png")}
                style={styles.icon}
              />
            </Transition>
          </View>
          <View style={styles.actionText}>
            <Transition shared="action">
              <Text style={styles.sheetCardAction}>Unlock</Text>
            </Transition>
          </View>
          <View style={styles.actionIcon}>
            <TouchableOpacity
              onPress={() => this.props.navigation.navigate("Intro")}
            >
              <Transition appear="scale">
                <Image
                  source={require("./assets/feather/close-2.png")}
                  style={styles.closeIcon}
                />
              </Transition>
            </TouchableOpacity>
          </View>
        </View>

        {this._renderContent()}
      </View>
    );
  };

  render() {
    return (
      <View style={styles.linearGradient}>
        <Transition shared="background">
          <LinearGradient
            start={{ x: 0.0, y: 0 }}
            end={{ x: 1, y: 1.0 }}
            locations={[0, 0.5]}
            colors={this.props.backgroundGradient}
            style={theme.absoluteFill}
          />
        </Transition>
        <View style={styles.container}>
          <ComponentLogo />
          <View style={styles.sheetContainer}>{this._renderUnlock()}</View>
        </View>
      </View>
    );
  }
}

export default withTheme(ScreenUnlock);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20
  },
  linearGradient: {
    flex: 1
  },
  sheetContainer: {
    flex: 2,
    justifyContent: "flex-end",
    paddingTop: 40
  },
  actionContainer: {
    flexDirection: "row"
  },
  actionIcon: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  sheetCard: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    flex: 1
  },
  sheetCardAction: {
    fontSize: 36,
    color: "white"
  },
  actionText: {
    flex: 1,
    alignItems: "center"
  },
  icon: {
    width: 30,
    height: 30,
    tintColor: "white"
  },
  closeIcon: {
    width: 20,
    height: 20,
    tintColor: "white"
  },
  contentContainer: {
    paddingHorizontal: 20
  }
});
