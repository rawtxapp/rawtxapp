import React from "react";
import ThemeConsumer from "./ContextTheme";

export default function withTheme(Component) {
  return function ThemedComponent(props) {
    return (
      <ThemeConsumer>
        {theme => <Component {...props} {...theme} />}
      </ThemeConsumer>
    );
  };
}

export { withTheme };
