// Originally from:
// https://github.com/halilb/react-native-textinput-effects/blob/master/lib/Sae.js
import React, { Component } from "react";
import PropTypes from "prop-types";
import {
  Animated,
  TextInput,
  TouchableWithoutFeedback,
  Text,
  View,
  ViewPropTypes,
  StyleSheet
} from "react-native";

class BaseInput extends Component {
  static propTypes = {
    label: PropTypes.string,
    value: PropTypes.string,
    defaultValue: PropTypes.string,
    style: ViewPropTypes ? ViewPropTypes.style : View.propTypes.style,
    inputStyle: Text.propTypes.style,
    labelStyle: Text.propTypes.style,
    easing: PropTypes.func,
    animationDuration: PropTypes.number,
    useNativeDriver: PropTypes.bool,

    editable: PropTypes.bool,

    /* those are TextInput props which are overridden
       * so, i'm calling them manually
       */
    onBlur: PropTypes.func,
    onFocus: PropTypes.func,
    onChange: PropTypes.func
  };

  constructor(props, context) {
    super(props, context);

    this._onLayout = this._onLayout.bind(this);
    this._onChange = this._onChange.bind(this);
    this._onBlur = this._onBlur.bind(this);
    this._onFocus = this._onFocus.bind(this);
    this.focus = this.focus.bind(this);

    const value = props.value || props.defaultValue;

    this.state = {
      value,
      focusedAnim: new Animated.Value(value ? 1 : 0)
    };
  }

  componentWillReceiveProps(newProps) {
    const newValue = newProps.value;
    if (newProps.hasOwnProperty("value") && newValue !== this.state.value) {
      this.setState({
        value: newValue
      });

      // animate input if it's active state has changed with the new value
      // and input is not focused currently.
      const isFocused = this.refs.input.isFocused();
      if (!isFocused) {
        const isActive = Boolean(newValue);
        if (isActive !== this.isActive) {
          this._toggle(isActive);
        }
      }
    }
  }

  _onLayout(event) {
    this.setState({
      width: event.nativeEvent.layout.width
    });
  }

  _onChange(event) {
    this.setState({
      value: event.nativeEvent.text
    });

    const onChange = this.props.onChange;
    if (onChange) {
      onChange(event);
    }
  }

  _onBlur(event) {
    if (!this.state.value) {
      this._toggle(false);
    }

    const onBlur = this.props.onBlur;
    if (onBlur) {
      onBlur(event);
    }
  }

  _onFocus(event) {
    this._toggle(true);

    const onFocus = this.props.onFocus;
    if (onFocus) {
      onFocus(event);
    }
  }

  _toggle(isActive) {
    const { animationDuration, easing, useNativeDriver } = this.props;
    this.isActive = isActive;
    Animated.timing(this.state.focusedAnim, {
      toValue: isActive ? 1 : 0,
      duration: animationDuration,
      easing,
      useNativeDriver
    }).start();
  }

  // public methods

  inputRef() {
    return this.refs.input;
  }

  focus() {
    if (this.props.editable !== false) {
      this.inputRef().focus();
    }
  }

  blur() {
    this.inputRef().blur();
  }

  isFocused() {
    return this.inputRef().isFocused();
  }

  clear() {
    this.inputRef().clear();
  }
}

const LABEL_HEIGHT = 24;
const PADDING = 16;

export default class Sae extends BaseInput {
  static propTypes = {
    height: PropTypes.number,
    /*
     * This is the icon component you are importing from react-native-vector-icons.
     * import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
     * iconClass={FontAwesomeIcon}
     */
    iconClass: PropTypes.func,
    /*
     * Passed to react-native-vector-icons library as name prop
     */
    iconName: PropTypes.string,
    /*
     * Passed to react-native-vector-icons library as color prop.
     * This is also used as border color.
     */
    iconColor: PropTypes.string
  };

  static defaultProps = {
    iconColor: "white",
    height: 48,
    animationDuration: 300,
    iconName: "pencil"
  };

  render() {
    const {
      iconClass,
      iconColor,
      iconName,
      label,
      style: containerStyle,
      height: inputHeight,
      inputStyle,
      labelStyle
    } = this.props;
    const { width, focusedAnim, value } = this.state;

    return (
      <View
        style={[
          styles.container,
          containerStyle,
          {
            height: inputHeight + PADDING
          }
        ]}
        onLayout={this._onLayout}
      >
        <TouchableWithoutFeedback onPress={this.focus}>
          <Animated.View
            style={{
              position: "absolute",
              bottom: focusedAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, LABEL_HEIGHT + PADDING]
              })
            }}
          >
            <Animated.Text
              style={[
                styles.label,
                labelStyle,
                {
                  fontSize: focusedAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [18, 12]
                  })
                }
              ]}
            >
              {label}
            </Animated.Text>
          </Animated.View>
        </TouchableWithoutFeedback>
        <TextInput
          ref="input"
          {...this.props}
          style={[
            styles.textInput,
            inputStyle,
            {
              width,
              height: inputHeight
            }
          ]}
          value={value}
          onBlur={this._onBlur}
          onChange={this._onChange}
          onFocus={this._onFocus}
          underlineColorAndroid={"transparent"}
        />
        <TouchableWithoutFeedback onPress={this.focus}>
          <Animated.Image
            source={require("../assets/edit.png")}
            style={{
              position: "absolute",
              bottom: 0,
              width: 16,
              height: 16,
              tintColor: "white",
              right: focusedAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, width + PADDING]
              }),
              transform: [
                {
                  rotate: focusedAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0deg", "-90deg"]
                  })
                }
              ]
            }}
          />
        </TouchableWithoutFeedback>
        {/* bottom border */}
        <View
          style={{
            position: "absolute",
            bottom: 0,
            right: 0,
            height: 1,
            width,
            backgroundColor: iconColor
          }}
        />
        <Animated.View
          style={{
            position: "absolute",
            bottom: 0,
            right: 0,
            height: 3,
            width: focusedAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, width]
            }),
            backgroundColor: iconColor
          }}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden"
  },
  label: {
    backgroundColor: "transparent",
    fontFamily: "Arial",
    fontWeight: "bold",
    color: "white"
  },
  textInput: {
    position: "absolute",
    bottom: 0,
    left: 0,
    paddingTop: PADDING / 2,
    paddingLeft: 0,
    color: "white",
    fontSize: 18
  }
});
