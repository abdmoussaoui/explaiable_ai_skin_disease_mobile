import React from "react";
import {
  ActivityIndicator,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  ViewStyle,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { COLORS } from "../constants/dermalens";

type AppButtonProps = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: "primary" | "secondary" | "quiet";
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

export function AppButton({
  title,
  onPress,
  disabled = false,
  loading = false,
  variant = "primary",
  style,
  textStyle,
}: AppButtonProps) {
  const isPrimary = variant === "primary";

  return (
    <TouchableOpacity
      activeOpacity={0.86}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.touchable,
        variant !== "primary" && styles.secondaryButton,
        variant === "quiet" && styles.quietButton,
        (disabled || loading) && styles.disabled,
        style,
      ]}
    >
      {isPrimary ? (
        <LinearGradient
          colors={["#1261A0", "#15B8D6"] as const}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={[styles.primaryText, textStyle]}>{title}</Text>
          )}
        </LinearGradient>
      ) : loading ? (
        <ActivityIndicator color={COLORS.medicalBlue} />
      ) : (
        <Text
          style={[
            styles.secondaryText,
            variant === "quiet" && styles.quietText,
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  touchable: {
    borderRadius: 8,
    minHeight: 52,
    overflow: "hidden",
  },
  gradient: {
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  primaryText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "800",
  },
  secondaryButton: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.medicalBlue,
    backgroundColor: COLORS.white,
    paddingHorizontal: 18,
  },
  quietButton: {
    borderColor: "#D7E5EF",
    backgroundColor: COLORS.softSky,
  },
  secondaryText: {
    color: COLORS.medicalBlue,
    fontSize: 15,
    fontWeight: "800",
  },
  quietText: {
    color: COLORS.deepNavy,
  },
  disabled: {
    opacity: 0.55,
  },
});
