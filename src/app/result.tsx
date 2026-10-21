import React, { useEffect, useState } from "react";
import {
  Animated,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";

import { AppButton } from "../components/AppButton";
import { ConfidenceBar } from "../components/ConfidenceBar";
import { InfoCard } from "../components/InfoCard";
import { TopKList } from "../components/TopKList";
import { WarningCard } from "../components/WarningCard";
import { COLORS } from "../constants/dermalens";
import { getLatestPrediction } from "../services/predictionStore";

export default function ResultScreen() {
  const stored = getLatestPrediction();
  const [entrance] = useState(() => new Animated.Value(0));

  useEffect(() => {
    Animated.timing(entrance, {
      toValue: 1,
      duration: 480,
      useNativeDriver: true,
    }).start();
  }, [entrance]);

  if (!stored) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No skin insight available yet</Text>
        <AppButton
          title="Start Skin Scan"
          onPress={() => router.push("/image-input" as any)}
        />
      </View>
    );
  }

  const { imageUri, prediction } = stored;
  const cardAnimation = {
    opacity: entrance,
    transform: [
      {
        translateY: entrance.interpolate({
          inputRange: [0, 1],
          outputRange: [14, 0],
        }),
      },
    ],
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>Your skin insight</Text>

      <Animated.View style={cardAnimation}>
        <InfoCard style={styles.imageCard}>
          <Text style={styles.sectionTitle}>Selected image</Text>
          <Image source={{ uri: imageUri }} style={styles.image} />
        </InfoCard>
      </Animated.View>

      <Animated.View style={cardAnimation}>
        <InfoCard>
          <Text style={styles.label}>Possible match</Text>
          <Text style={styles.prediction}>{prediction.topClass}</Text>
          <View style={styles.confidenceBlock}>
            <ConfidenceBar value={prediction.confidence} />
          </View>
        </InfoCard>
      </Animated.View>

      <InfoCard>
        <Text style={styles.sectionTitle}>Top 3 possible matches</Text>
        <TopKList items={prediction.topK} />
      </InfoCard>

      <InfoCard style={styles.imageCard}>
        <Text style={styles.sectionTitle}>Focused highlight</Text>
        <Image source={{ uri: prediction.heatmapDataUri }} style={styles.heatmap} />
        <Text style={styles.explanation}>
          The highlighted area shows the part of the image that influenced the
          visual insight most.
        </Text>
      </InfoCard>

      <WarningCard text={prediction.warning} />

      <View style={styles.buttons}>
        <AppButton
          title="Ask Skin Assistant"
          onPress={() => router.push("/assistant" as any)}
        />
        <AppButton
          title="Scan another image"
          variant="secondary"
          onPress={() => router.push("/image-input" as any)}
        />
      </View>
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
  emptyContainer: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    gap: 16,
    backgroundColor: COLORS.page,
  },
  emptyTitle: {
    color: COLORS.deepNavy,
    fontSize: 24,
    lineHeight: 31,
    fontWeight: "900",
  },
  pageTitle: {
    color: COLORS.deepNavy,
    fontSize: 30,
    fontWeight: "900",
  },
  imageCard: {
    padding: 12,
  },
  sectionTitle: {
    color: COLORS.deepNavy,
    fontSize: 17,
    fontWeight: "900",
    marginBottom: 12,
  },
  image: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 8,
    resizeMode: "cover",
    backgroundColor: "#D5DFEA",
  },
  heatmap: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 8,
    resizeMode: "contain",
    backgroundColor: COLORS.softSky,
  },
  label: {
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: "900",
    marginBottom: 6,
    textTransform: "uppercase",
  },
  prediction: {
    color: COLORS.deepNavy,
    fontSize: 25,
    lineHeight: 31,
    fontWeight: "900",
  },
  confidenceBlock: {
    marginTop: 18,
  },
  explanation: {
    color: COLORS.muted,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 12,
  },
  buttons: {
    gap: 12,
    marginBottom: 12,
  },
});
