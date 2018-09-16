import React from "react";
import LndConsumer from "./ContextLnd.js";

export default function withLnd(Component) {
  return function LndedComponent(props) {
    return (
      <LndConsumer>{lnd => <Component {...props} {...lnd} />}</LndConsumer>
    );
  };
}

export function withLndRef(Component) {
  return React.forwardRef((props, ref) => (
    <LndConsumer>
      {lnd => <Component ref={ref} {...props} {...lnd} />}
    </LndConsumer>
  ));
}

export { withLnd };
