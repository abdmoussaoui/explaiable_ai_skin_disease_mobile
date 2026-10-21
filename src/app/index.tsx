import React, { useEffect, useState } from "react";
import {
  Animated,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router, Stack } from "expo-router";

import { AppButton } from "../components/AppButton";
import { InfoCard } from "../components/InfoCard";
import { WarningCard } from "../components/WarningCard";
import { COLORS } from "../constants/dermalens";

const logo = require("../../assets/images/Dermalens.png");

const introSteps = [
  {
    title: "Capture",
    text: "Use the square frame or choose a clear photo.",
  },
  {
    title: "Analyze",
    text: "DermaLens prepares a 224 x 224 skin image.",
  },
  {
    title: "Review",
    text: "See the match, confidence, and focused highlight.",
  },
];

const features = [
  {
    title: "Square scan",
    text: "Camera and gallery images are normalized for the model.",
  },
  {
    title: "Focused result",
    text: "Confidence, top matches, and visual highlight stay easy to scan.",
  },
  {
    title: "Skin assistant",
    text: "Ask short follow-up questions after a result.",
  },
];

export default function HomeScreen() {
  const [showIntro, setShowIntro] = useState(true);
  const [step, setStep] = useState(0);
  const [introEntrance] = useState(() => new Animated.Value(0));
  const [homeEntrance] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (!showIntro) return;

    introEntrance.setValue(0);
    Animated.timing(introEntrance, {
      toValue: 1,
      duration: 280,
      useNativeDriver: true,
    }).start();
  }, [introEntrance, showIntro, step]);

  useEffect(() => {
    if (showIntro) return;

    Animated.timing(homeEntrance, {
      toValue: 1,
      duration: 420,
      useNativeDriver: true,
    }).start();
  }, [homeEntrance, showIntro]);

  function moveIntroForward() {
    if (step < introSteps.length - 1) {
      setStep((current) => current + 1);
      return;
    }

    setShowIntro(false);
  }

  if (showIntro) {
    const introStyle = {
      opacity: introEntrance,
      transform: [
        {
          translateY: introEntrance.interpolate({
            inputRange: [0, 1],
            outputRange: [10, 0],
          }),
        },
      ],
    };

    return (
      <View style={styles.introContainer}>
        <Stack.Screen options={{ headerShown: false }} />

        <Animated.View style={[styles.introContent, introStyle]}>
          <Image source={logo} style={styles.introLogo} />

          <View style={styles.stepBadge}>
            <Text style={styles.stepBadgeText}>
              {step + 1} / {introSteps.length}
            </Text>
          </View>

          <Text style={styles.introTitle}>{introSteps[step].title}</Text>
          <Text style={styles.introText}>{introSteps[step].text}</Text>

          <View style={styles.dots}>
            {introSteps.map((item, index) => (
              <View
                key={item.title}
                style={[styles.dot, index === step && styles.activeDot]}
              />
            ))}
          </View>

          <AppButton
            title={step === introSteps.length - 1 ? "Open DermaLens" : "Next"}
            onPress={moveIntroForward}
          />

          {step < introSteps.length - 1 && (
            <TouchableOpacity
              activeOpacity={0.72}
              onPress={() => setShowIntro(false)}
              style={styles.skipButton}
            >
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
          )}
        </Animated.View>
      </View>
    );
  }

  const homeStyle = {
    opacity: homeEntrance,
    transform: [
      {
        translateY: homeEntrance.interpolate({
          inputRange: [0, 1],
          outputRange: [16, 0],
        }),
      },
    ],
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ headerShown: false }} />

      <Animated.View style={homeStyle}>
        <View style={styles.header}>
          <Image source={logo} style={styles.logo} />
          <View>
            <Text style={styles.brand}>DermaLens</Text>
            <Text style={styles.brandSubtext}>Skin insight assistant</Text>
          </View>
        </View>

        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Scan. Review. Ask.</Text>
          <Text style={styles.heroText}>
            Capture a focused skin image and get a quick AI-assisted insight.
          </Text>

          <View style={styles.heroActions}>
            <AppButton
              title="Start scan"
              onPress={() => router.push("/image-input" as any)}
            />
            <AppButton
              title="About"
              variant="secondary"
              onPress={() => router.push("/about" as any)}
            />
          </View>
        </View>
      </Animated.View>

      <View style={styles.featureGrid}>
        {features.map((feature) => (
          <InfoCard key={feature.title} style={styles.featureCard}>
            <View style={styles.featureHeader}>
              <View style={styles.featureMark} />
              <Text style={styles.featureTitle}>{feature.title}</Text>
            </View>
            <Text style={styles.featureText}>{feature.text}</Text>
          </InfoCard>
        ))}
      </View>

      <InfoCard style={styles.makerCard}>
        <Text style={styles.makerLabel}>Project</Text>
        <Text style={styles.makerText}>
          Built by ZOUHAIRI Youness and MOUSSAOUI Abdelkarim.
        </Text>
      </InfoCard>

      <WarningCard text="AI support only. Check urgent or changing skin concerns with a clinician." />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  introContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: COLORS.page,
    padding: 24,
  },
  introContent: {
    gap: 16,
  },
  introLogo: {
    width: 164,
    height: 164,
    resizeMode: "contain",
    alignSelf: "center",
    marginBottom: 8,
  },
  stepBadge: {
    alignSelf: "center",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: COLORS.softMint,
    borderWidth: 1,
    borderColor: "#BFEFE0",
  },
  stepBadgeText: {
    color: COLORS.medicalBlue,
    fontSize: 13,
    fontWeight: "900",
  },
  introTitle: {
    color: COLORS.deepNavy,
    fontSize: 32,
    lineHeight: 38,
    textAlign: "center",
    fontWeight: "900",
  },
  introText: {
    color: COLORS.muted,
    fontSize: 16,
    lineHeight: 23,
    textAlign: "center",
    marginBottom: 6,
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginBottom: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: "#C6D6E0",
  },
  activeDot: {
    width: 22,
    backgroundColor: COLORS.cyan,
  },
  skipButton: {
    alignSelf: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  skipText: {
    color: COLORS.muted,
    fontSize: 15,
    fontWeight: "800",
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.page,
  },
  content: {
    padding: 20,
    paddingTop: 56,
    gap: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 18,
  },
  logo: {
    width: 56,
    height: 56,
    borderRadius: 12,
  },
  brand: {
    color: COLORS.deepNavy,
    fontSize: 24,
    fontWeight: "900",
  },
  brandSubtext: {
    color: COLORS.muted,
    fontSize: 14,
    fontWeight: "700",
  },
  hero: {
    borderRadius: 8,
    padding: 22,
    backgroundColor: COLORS.softSky,
    borderWidth: 1,
    borderColor: "#D6E8F3",
    gap: 12,
  },
  heroTitle: {
    color: COLORS.deepNavy,
    fontSize: 34,
    lineHeight: 40,
    fontWeight: "900",
  },
  heroText: {
    color: COLORS.textDark,
    fontSize: 16,
    lineHeight: 23,
  },
  heroActions: {
    gap: 10,
    marginTop: 8,
  },
  featureGrid: {
    gap: 12,
  },
  featureCard: {
    padding: 16,
  },
  featureHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  featureMark: {
    width: 12,
    height: 12,
    borderRadius: 999,
    backgroundColor: COLORS.cyan,
  },
  featureTitle: {
    color: COLORS.deepNavy,
    fontSize: 16,
    fontWeight: "900",
  },
  featureText: {
    color: COLORS.muted,
    fontSize: 14,
    lineHeight: 21,
  },
  makerCard: {
    backgroundColor: "#F8FDFA",
    borderColor: "#D5EFE5",
  },
  makerLabel: {
    color: COLORS.medicalBlue,
    fontSize: 13,
    fontWeight: "900",
    marginBottom: 6,
  },
  makerText: {
    color: COLORS.textDark,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "700",
  },
});
