import React, { Component } from "react";
import {
  Animated,
  LayoutAnimation,
  Text,
  StyleSheet,
  View,
  WebView
} from "react-native";
import withMicro from "./withMicro";
import {
  EVENT_NEW_PAYMENT,
  EVENT_PAYMENT_SUCCESS,
  EVENT_PAYMENT_FAIL
} from "./Micro";
import { timeout } from "../Utils";

class ComponentAllowanceStatus extends Component {
  constructor(props) {
    super(props);
    this.state = { pending: [] };
    // this.state.pending is used for reactively updating the UI.
    // this.pending is a map of invoice->(decoded+view related info).
    this.pending = {};
    this.allowanceStatusAnim = new Animated.Value(1);
  }

  componentDidMount() {
    this.newPaymentListener = this.props.microEvents.addListener(
      EVENT_NEW_PAYMENT,
      this.addNewPayment
    );
    this.successPaymentListener = this.props.microEvents.addListener(
      EVENT_PAYMENT_SUCCESS,
      this.successPayment
    );
    this.failPaymentListener = this.props.microEvents.addListener(
      EVENT_PAYMENT_FAIL,
      this.failPayment
    );
  }

  componentWillUnmount() {
    this.newPaymentListener.remove();
    this.successPaymentListener.remove();
    this.failPaymentListener.remove();
  }

  addNewPayment = (invoice, decoded) => {
    if (this.pending[invoice]) return;

    const anim = new Animated.Value(0);
    this.pending[invoice] = { ...decoded, anim };
    this.setState(
      (state, props) => {
        state.pending.unshift(invoice);
        return { pending: state.pending };
      },
      () => Animated.spring(anim, { toValue: 1, useNativeDriver: true }).start()
    );
  };

  removePending = invoice => {
    const ix = this.state.pending.indexOf(invoice);
    if (ix < 0) return;

    this.setState(
      (state, props) => {
        state.pending.splice(ix, 1);
        return { pending: state.pending };
      },
      () => {
        this.pending[invoice] = null;
      }
    );
  };

  successPayment = invoice => {
    const p = this.pending[invoice];
    if (!p) return;

    LayoutAnimation.easeInEaseOut();
    this.removePending(invoice);
    Animated.sequence([
      Animated.timing(this.allowanceStatusAnim, {
        toValue: 2,
        useNativeDriver: true,
        duration: 200
      }),
      Animated.timing(this.allowanceStatusAnim, {
        toValue: 1,
        useNativeDriver: true,
        duration: 200
      })
    ]).start();
  };

  failPayment = async invoice => {
    const p = this.pending[invoice];
    if (!p) return;

    // lightning payments can be too fast for the user to see the payment being
    // shown and removed. add artificial delay.
    await timeout(400);

    Animated.spring(p.anim, { toValue: 0, useNativeDriver: true }).start(() => {
      this.removePending(invoice);
    });
  };

  _renderPending = () => {
    return (
      <View style={styles.pendingContainer}>
        {this.state.pending.map(i => {
          const amt = this.pending[i].num_satoshis;
          const anim = this.pending[i].anim;
          return (
            <Animated.View
              key={i}
              style={[
                styles.pending,
                {
                  opacity: anim.interpolate({
                    inputRange: [0, 1, 2],
                    outputRange: [0, 1, 0]
                  }),
                  transform: [
                    {
                      scaleX: anim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 1]
                      })
                    },
                    {
                      scaleY: anim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 1]
                      })
                    },
                    {
                      translateX: anim.interpolate({
                        inputRange: [0, 1, 2],
                        outputRange: [-100, 0, 100]
                      })
                    }
                  ]
                }
              ]}
            >
              <Text
                style={[
                  styles.pendingText,
                  this.props.lapp.statusBarContentColor && {
                    color: this.props.lapp.statusBarContentColor
                  }
                ]}
              >
                {amt}
              </Text>
            </Animated.View>
          );
        })}
      </View>
    );
  };

  _withMicro = () => {
    return (
      <View style={styles.pendingContainer}>
        {this._renderPending()}
        <Animated.View
          style={{
            paddingRight: 5,
            transform: [
              {
                scaleX: this.allowanceStatusAnim.interpolate({
                  inputRange: [1, 2],
                  outputRange: [1, 1.3]
                })
              },
              {
                scaleY: this.allowanceStatusAnim.interpolate({
                  inputRange: [1, 2],
                  outputRange: [1, 1.3]
                })
              }
            ]
          }}
        >
          <Text
            style={[
              styles.currentAllowance,
              this.props.lapp.statusBarContentColor && {
                color: this.props.lapp.statusBarContentColor
              }
            ]}
          >
            {this.props.currentAllowance}
          </Text>
        </Animated.View>
      </View>
    );
  };

  _withoutMicro = () => {
    return (
      <View style={[styles.pendingContainer]}>
        <Text
          style={[
            this.props.lapp.statusBarContentColor && {
              color: this.props.lapp.statusBarContentColor
            }
          ]}
        >
          no micro support
        </Text>
      </View>
    );
  };

  render() {
    if (this.props.lapp.microEnabled) return this._withMicro();
    else return this._withoutMicro();
  }
}

export default withMicro(ComponentAllowanceStatus);

const styles = StyleSheet.create({
  pendingContainer: {
    flexDirection: "row"
  },
  pending: {
    marginRight: 5
  },
  pendingText: {
    color: "red"
  },
  currentAllowance: {
    color: "green"
  }
});
