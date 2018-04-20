import React from "react";
import LndConsumer from "./ContextLnd.js";

export default function withLnd(Component) {
  return function LndedComponent(props) {
    return (
      <LndConsumer>{lnd => <Component {...props} {...lnd} />}</LndConsumer>
    );
  };
}

export { withLnd };
