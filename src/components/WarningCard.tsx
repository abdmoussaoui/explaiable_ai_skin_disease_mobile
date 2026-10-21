import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { COLORS, SAFETY_WARNING } from "../constants/dermalens";

type WarningCardProps = {
  text?: string;
};

export function WarningCard({ text = SAFETY_WARNING }: WarningCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Safety note</Text>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.warmWarning,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F7D8AE",
  },
  title: {
    color: "#9A5B12",
    fontSize: 14,
    fontWeight: "900",
    marginBottom: 6,
  },
  text: {
    color: COLORS.textDark,
    fontSize: 14,
    lineHeight: 21,
  },
});
