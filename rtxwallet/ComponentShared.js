import React, { Component } from "react";
import { Text } from "react-native";

import shared from "./SharedStyles.js";

const BoldText = text => <Text style={shared.boldText}>{text}</Text>;

export { BoldText };
