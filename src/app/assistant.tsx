import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";

import { AppButton } from "../components/AppButton";
import { ConfidenceBar } from "../components/ConfidenceBar";
import { InfoCard } from "../components/InfoCard";
import { WarningCard } from "../components/WarningCard";
import { COLORS } from "../constants/dermalens";
import { askSkinAssistant } from "../services/assistantApi";
import { getLatestPrediction } from "../services/predictionStore";

const suggestions = [
  "What does this result generally mean?",
  "When should I see a professional?",
  "How can I take a clearer photo?",
  "What should I avoid doing?",
];

export default function AssistantScreen() {
  const stored = getLatestPrediction();
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);

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

  const { prediction } = stored;

  async function submitQuestion() {
    const trimmed = question.trim();

    if (!trimmed) {
      Alert.alert("Question needed", "Please enter a question first.");
      return;
    }

    if (trimmed.length > 500) {
      Alert.alert("Question too long", "Please keep your question under 500 characters.");
      return;
    }

    try {
      setLoading(true);
      const response = await askSkinAssistant({
        predictedClass: prediction.topClass,
        confidence: prediction.confidence,
        topK: prediction.topK,
        userQuestion: trimmed,
      });

      setAnswer(response.answer);
      setWarning(response.warning);
    } catch (error) {
      console.error(error);
      Alert.alert(
        "Assistant unavailable",
        "The skin assistant is temporarily unavailable. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.keyboard}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.pageTitle}>Skin Assistant</Text>

        <InfoCard>
          <Text style={styles.label}>Current skin insight</Text>
          <Text style={styles.match}>{prediction.topClass}</Text>
          <View style={styles.confidence}>
            <ConfidenceBar value={prediction.confidence} />
          </View>
        </InfoCard>

        <View style={styles.suggestionGrid}>
          {suggestions.map((item) => (
            <TouchableOpacity
              key={item}
              activeOpacity={0.8}
              onPress={() => setQuestion(item)}
              style={styles.suggestion}
              disabled={loading}
            >
              <Text style={styles.suggestionText}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <InfoCard>
          <TextInput
            value={question}
            onChangeText={setQuestion}
            placeholder="Ask about this skin insight..."
            placeholderTextColor="#8091A0"
            multiline
            maxLength={500}
            style={styles.input}
            editable={!loading}
          />
          <Text style={styles.counter}>{question.length}/500</Text>
          <AppButton
            title="Ask Assistant"
            onPress={submitQuestion}
            loading={loading}
            disabled={loading}
          />
        </InfoCard>

        {answer && (
          <InfoCard>
            <Text style={styles.answerTitle}>Assistant answer</Text>
            <Text style={styles.answer}>{answer}</Text>
          </InfoCard>
        )}

        <WarningCard text={warning} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboard: {
    flex: 1,
  },
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
  label: {
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: "900",
    marginBottom: 6,
    textTransform: "uppercase",
  },
  match: {
    color: COLORS.deepNavy,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "900",
  },
  confidence: {
    marginTop: 16,
  },
  suggestionGrid: {
    gap: 10,
  },
  suggestion: {
    minHeight: 48,
    justifyContent: "center",
    borderRadius: 8,
    paddingHorizontal: 14,
    backgroundColor: COLORS.softSky,
    borderWidth: 1,
    borderColor: "#D2E4F0",
  },
  suggestionText: {
    color: COLORS.deepNavy,
    fontWeight: "800",
  },
  input: {
    minHeight: 118,
    color: COLORS.textDark,
    fontSize: 16,
    lineHeight: 23,
    textAlignVertical: "top",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D7E5EF",
    backgroundColor: "#FAFDFF",
    padding: 14,
    marginBottom: 8,
  },
  counter: {
    alignSelf: "flex-end",
    color: COLORS.muted,
    fontSize: 12,
    marginBottom: 12,
  },
  answerTitle: {
    color: COLORS.deepNavy,
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 10,
  },
  answer: {
    color: COLORS.textDark,
    fontSize: 15,
    lineHeight: 23,
  },
});
