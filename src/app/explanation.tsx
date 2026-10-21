import React from "react";
import { ScrollView, StyleSheet, Text } from "react-native";
import { router } from "expo-router";

import { AppButton } from "../components/AppButton";
import { InfoCard } from "../components/InfoCard";
import { WarningCard } from "../components/WarningCard";
import { COLORS } from "../constants/dermalens";

export default function ExplanationScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>How DermaLens explains an insight</Text>

      <InfoCard>
        <Text style={styles.sectionTitle}>Visual insight</Text>
        <Text style={styles.text}>
          DermaLens compares visual patterns in the selected image and presents a
          possible match with a confidence score. The result is educational
          support, not medical certainty.
        </Text>
      </InfoCard>

      <InfoCard>
        <Text style={styles.sectionTitle}>Focused highlight</Text>
        <Text style={styles.text}>
          The focused highlight shows the part of the image that influenced the
          visual insight most. It can help you understand where the app was
          looking.
        </Text>
      </InfoCard>

      <AppButton
        title="Open Skin Assistant"
        onPress={() => router.push("/assistant" as any)}
      />

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
  title: {
    color: COLORS.deepNavy,
    fontSize: 28,
    lineHeight: 35,
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
});
