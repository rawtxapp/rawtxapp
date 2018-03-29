import React, { Component, createContext } from 'react';

const LndContext = createContext({ startLnd: () => {}, stopLnd: () => {} });

import { startLnd, stopLnd, getLndCert } from './NativeRtxModule.js';
import LndApi from './RestLnd.js';

class LndProvider extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <LndContext.Provider
        value={{
          startLnd,
          stopLnd,
          getLndInfo: LndApi.getInfo,
          genSeed: LndApi.genSeed,
        }}
      >
        {this.props.children}
      </LndContext.Provider>
    );
  }
}

export default LndContext.Consumer;
export { LndProvider };
