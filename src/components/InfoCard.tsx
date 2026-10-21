import React from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";

import { COLORS } from "../constants/dermalens";

type InfoCardProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function InfoCard({ children, style }: InfoCardProps) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E4EEF5",
    shadowColor: "#071A2B",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 3,
  },
});
