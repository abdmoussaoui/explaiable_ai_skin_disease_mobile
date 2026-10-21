import { fetch as expoFetch } from "expo/fetch";
import { File } from "expo-file-system";
import { Platform } from "react-native";

export type TopKPrediction = {
  class_id: number;
  class_name: string;
  confidence: number;
};

export type ApiPredictionResponse = {
  predicted_class_id: number;
  predicted_class: string;
  confidence: number;
  top_k: TopKPrediction[];
  heatmap_base64: string;
  heatmap_content_type: string;
  warning: string;
};

export type MobilePredictionResult = {
  topClass: string;
  confidence: number;
  topK: {
    className: string;
    confidence: number;
  }[];
  heatmapDataUri: string;
  warning: string;
};

export const API_BASE_URL = "http://3.90.239.249:8000";

function getFileNameFromUri(uri: string) {
  const parts = uri.split("/");
  const rawName = parts[parts.length - 1];

  if (!rawName || rawName.startsWith("blob:")) {
    return "skin-image.jpg";
  }

  return rawName;
}

async function appendImageToFormData(formData: FormData, imageUri: string) {
  const fileName = getFileNameFromUri(imageUri);

  if (Platform.OS === "web") {
    const imageResponse = await fetch(imageUri);
    const imageBlob = await imageResponse.blob();

    formData.append("file", imageBlob, fileName);
    return;
  }

  const imageFile = new File(imageUri);

  formData.append("file", imageFile as unknown as Blob, fileName);
}

export async function runApiInference(
  imageUri: string
): Promise<MobilePredictionResult> {
  const formData = new FormData();

  await appendImageToFormData(formData, imageUri);

  const fetcher = Platform.OS === "web" ? fetch : expoFetch;
  const response = await fetcher(`${API_BASE_URL}/predict`, {
    method: "POST",
    body: formData,
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API error ${response.status}: ${errorText}`);
  }

  const data: ApiPredictionResponse = await response.json();

  return {
    topClass: data.predicted_class,
    confidence: data.confidence,
    topK: data.top_k.map((item) => ({
      className: item.class_name,
      confidence: item.confidence,
    })),
    heatmapDataUri: `data:${data.heatmap_content_type};base64,${data.heatmap_base64}`,
    warning: data.warning,
  };
}
