import React, { Component, createContext } from "react";
import { View } from "react-native";
import EventEmitter from "EventEmitter";
import Micro from "./Micro";
import withLnd from "../withLnd";

const MicroCtx = createContext({});

class MicroProviderBase extends Component {
  constructor(props) {
    super(props);
    const microEvents = new EventEmitter();
    this.state = {
      micro: new Micro(
        this.props.lapp,
        microEvents,
        this.props.lndApi.decodepayreq,
        async invoice => {
          try {
            const res = await this.props.lndApi.sendpaymentPayreq(invoice);
            if (
              !res ||
              res.payment_error ||
              // TODO: handle timeout error
              res.error
            ) {
              return false;
            }
            return true;
          } catch (err) {
            return false;
          }
        }
      ),
      microEvents
    };
  }

  componentDidMount() {
    const updateAllowance = allowance => this.setState({ allowance });
    this.state.micro.getAppAllowanceFromDB().then(updateAllowance);
    this.state.micro.setUpdateAllowanceTextFn(updateAllowance);
  }

  render() {
    return (
      <MicroCtx.Provider
        value={{
          micro: this.state.micro,
          lapp: this.props.lapp,
          currentAllowance: this.state.allowance,
          microEvents: this.state.microEvents
        }}
      >
        {this.props.children}
      </MicroCtx.Provider>
    );
  }
}

export default MicroCtx.Consumer;
const MicroProvider = withLnd(MicroProviderBase);
export { MicroProvider };
