import React from "react";
import { ScrollView, StyleSheet, Text } from "react-native";

import { InfoCard } from "../components/InfoCard";
import { WarningCard } from "../components/WarningCard";
import { COLORS } from "../constants/dermalens";

export default function AboutScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.brand}>DermaLens</Text>
      <Text style={styles.title}>Smart skin-care assistant</Text>

      <InfoCard>
        <Text style={styles.text}>
          DermaLens is a smart skin-care assistant built as a Machine Learning
          final module project.
        </Text>
      </InfoCard>

      <InfoCard>
        <Text style={styles.sectionTitle}>Makers</Text>
        <Text style={styles.name}>ZOUHAIRI Youness</Text>
        <Text style={styles.name}>MOUSSAOUI Abdelkarim</Text>
      </InfoCard>

      <InfoCard>
        <Text style={styles.sectionTitle}>Academic context</Text>
        <Text style={styles.text}>Master Intelligence Artificielle 2025-2026</Text>
        <Text style={styles.text}>Machine Learning final project</Text>
      </InfoCard>

      <InfoCard>
        <Text style={styles.sectionTitle}>Backend note</Text>
        <Text style={styles.text}>
          Powered by a visual skin insight backend and an educational assistant.
        </Text>
      </InfoCard>

      <WarningCard />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.page,
  },
  content: {
    padding: 20,
    gap: 16,
  },
  brand: {
    color: COLORS.medicalBlue,
    fontSize: 18,
    fontWeight: "900",
  },
  title: {
    color: COLORS.deepNavy,
    fontSize: 30,
    lineHeight: 37,
    fontWeight: "900",
  },
  sectionTitle: {
    color: COLORS.deepNavy,
    fontSize: 17,
    fontWeight: "900",
    marginBottom: 10,
  },
  text: {
    color: COLORS.textDark,
    fontSize: 15,
    lineHeight: 23,
  },
  name: {
    color: COLORS.textDark,
    fontSize: 16,
    lineHeight: 25,
    fontWeight: "800",
  },
});
