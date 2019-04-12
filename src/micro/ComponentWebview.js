import React, { Component } from "react";
import { StyleSheet, Text, View } from "react-native";
import ComponentActionSheet from "../ComponentActionSheet";
import ScreenSend from "../ScreenSend";
import Micro from "./Micro";
import withMicro from "./withMicro";
import { WebView } from "react-native-webview";

// This JS is loaded after the page, the goal is to capture lightning:
// links and convert them to a lightning: message to be handled by Micro.
// Taken from:
// https://stackoverflow.com/questions/2136461/use-javascript-to-intercept-all-document-link-clicks
const INTERCEPT_JS =
  "function interceptClickEvent(e) { var href; var target = e.target || e.srcElement; if (target.tagName === 'A') { href = target.getAttribute('href'); if (href.startsWith('lightning:')) { e.preventDefault(); window.ReactNativeWebView.postMessage(href) } } } if (document.addEventListener) { document.addEventListener('click', interceptClickEvent); } else if (document.attachEvent) { document.attachEvent('onclick', interceptClickEvent); }";

class ComponentWebview extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  setWebviewRef = ref => {
    this.webviewRef = ref;
    if (this.props.micro) {
      this.props.micro.setSendMessage(data =>
        this.webviewRef.postMessage(data)
      );
    }
  };

  onMessage = evt => {
    const data = evt.nativeEvent.data;

    if (this.props.micro) {
      this.props.micro.onReceivedMessage(evt.nativeEvent.data);
    }
  };

  onLoad = () => {
    if (this.webviewRef) {
      if (this.props.micro) {
        this.props.micro.setShowPayInvoiceScreen(invoice => {
          // don't let it open another invoice payment screen if one is already
          // ongoing.
          if (this.state.lightningInvoice) return;
          this.setState({ lightningInvoice: invoice });
        });
        this.props.micro.init();
      } else {
        console.error("No micro found in onLoad for lapp webview.");
      }
    } else {
      console.error("No webviewref found.");
    }
    try {
      this.webviewRef.injectJavaScript(INTERCEPT_JS);
    } catch (err) {
      console.error(err);
    }
  };

  renderError = () => {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text>Couldn't load lapp!</Text>
      </View>
    );
  };

  _renderSend = () => {
    const closeModal = () => this.setState({ lightningInvoice: null });
    return (
      <ComponentActionSheet
        visible={!!this.state.lightningInvoice}
        onRequestClose={closeModal}
        animationType="slide"
        buttonText="Done"
        title="Send"
      >
        <ScreenSend payreq={this.state.lightningInvoice} />
      </ComponentActionSheet>
    );
  };

  render() {
    return (
      <View style={styles.container}>
        <WebView
          ref={this.setWebviewRef}
          source={{ uri: this.props.lapp.url }}
          style={styles.webview}
          javaScriptEnabled={true}
          startInLoadingState={true}
          onMessage={this.onMessage.bind(this)}
          onLoad={this.onLoad.bind(this)}
          renderError={this.renderError}
        />
        {this._renderSend()}
      </View>
    );
  }
}

export default withMicro(ComponentWebview);

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  webview: {
    flex: 1
  },
  statusContainer: {
    paddingHorizontal: 10
  },
  centerContent: {
    alignItems: "center",
    justifyContent: "center"
  }
});
