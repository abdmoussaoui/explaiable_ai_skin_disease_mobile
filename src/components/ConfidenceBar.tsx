import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { COLORS } from "../constants/dermalens";

type ConfidenceBarProps = {
  value: number;
};

export function ConfidenceBar({ value }: ConfidenceBarProps) {
  const percent = Math.max(0, Math.min(100, value * 100));

  return (
    <View>
      <View style={styles.header}>
        <Text style={styles.label}>Confidence score</Text>
        <Text style={styles.value}>{percent.toFixed(1)}%</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${percent}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  label: {
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: "800",
  },
  value: {
    color: COLORS.medicalBlue,
    fontSize: 15,
    fontWeight: "900",
  },
  track: {
    height: 10,
    borderRadius: 999,
    overflow: "hidden",
    backgroundColor: "#DCEAF3",
  },
  fill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: COLORS.cyan,
  },
});
