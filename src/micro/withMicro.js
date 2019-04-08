import React from "react";
import MicroConsumer from "./ContextMicro";

export default function withMicro(Component) {
  return function MicroedComponent(props) {
    return (
      <MicroConsumer>
        {micro => <Component {...props} {...micro} />}
      </MicroConsumer>
    );
  };
}

export { withMicro };
