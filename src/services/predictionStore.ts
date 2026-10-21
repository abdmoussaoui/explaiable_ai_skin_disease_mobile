import type { MobilePredictionResult } from "./apiInference";

export type StoredPrediction = {
  imageUri: string;
  prediction: MobilePredictionResult;
};

let latestPrediction: StoredPrediction | null = null;

export function setLatestPrediction(value: StoredPrediction) {
  latestPrediction = value;
}

export function getLatestPrediction() {
  return latestPrediction;
}

export function clearLatestPrediction() {
  latestPrediction = null;
}
