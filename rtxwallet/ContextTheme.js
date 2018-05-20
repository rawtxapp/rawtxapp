import React, { Component, createContext } from "react";
import { StyleSheet, View } from "react-native";

const Theme = createContext({});

class ThemeProvider extends Component {
  constructor(props) {
    super(props);
    this.state = { dimmed: false };
  }

  dimBackground = dim => {
    if (this.state.dimmed == dim) return;
    this.setState({ dimmed: dim });
  };

  render() {
    return (
      <Theme.Provider
        value={{
          theme: defaultTheme,
          dimBackground: this.dimBackground
        }}
      >
        {this.props.children}
        {!!this.state.dimmed && <View style={styles.dim} />}
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
    backgroundColor: "black",
    opacity: 0.5
  }
});

const defaultTheme = StyleSheet.create({});
