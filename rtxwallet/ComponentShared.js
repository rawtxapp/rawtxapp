import React, { Component } from "react";
import { Text } from "react-native";

import { styles as theme } from "react-native-theme";

const BoldText = text => <Text style={theme.boldText}>{text}</Text>;

export { BoldText };
