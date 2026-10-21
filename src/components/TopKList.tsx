import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { COLORS } from "../constants/dermalens";

type TopKListProps = {
  items: {
    className: string;
    confidence: number;
  }[];
};

export function TopKList({ items }: TopKListProps) {
  return (
    <View style={styles.list}>
      {items.slice(0, 3).map((item, index) => (
        <View key={`${item.className}-${index}`} style={styles.row}>
          <View style={styles.rank}>
            <Text style={styles.rankText}>{index + 1}</Text>
          </View>
          <Text style={styles.name}>{item.className}</Text>
          <Text style={styles.score}>{(item.confidence * 100).toFixed(1)}%</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 10,
  },
  row: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  rank: {
    width: 28,
    height: 28,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.softMint,
  },
  rankText: {
    color: COLORS.deepNavy,
    fontWeight: "900",
  },
  name: {
    flex: 1,
    color: COLORS.textDark,
    fontSize: 15,
    fontWeight: "700",
  },
  score: {
    color: COLORS.medicalBlue,
    fontWeight: "900",
  },
});
