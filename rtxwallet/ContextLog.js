import React, { Component, createContext } from 'react';

const LogContext = createContext({ logText: 'TestLog' });
import {
  getLogContent,
  startWatchingLogContent,
  stopWatchingLogContent,
} from './NativeRtxModule.js';

class LogProvider extends Component {
  constructor(props) {
    super(props);
    this.state = { logText: '' };
  }

  componentDidMount() {
    //const updateLogState = log => {
      //this.setState({ logText: log });
    //};
    //getLogContent(updateLogState);
    //this.updateLogStateFromContent_ = () => {
      //getLogContent(updateLogState);
    //};
    //startWatchingLogContent(this.updateLogStateFromContent_);
  }

  componentWillUnmount() {
    //stopWatchingLogContent(this.updateLogStateFromContent_);
  }

  render() {
    return (
      <LogContext.Provider value={{ logText: this.state.logText }}>
        {this.props.children}
      </LogContext.Provider>
    );
  }
}

export default LogContext.Consumer;
export { LogProvider };
