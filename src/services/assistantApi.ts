import { API_BASE_URL } from "./apiInference";

export type AssistantTopKItem = {
  class_name: string;
  confidence: number;
};

export type AssistantRequest = {
  predicted_class: string;
  confidence: number;
  top_k: AssistantTopKItem[];
  user_question: string;
};

export type AssistantResponse = {
  answer: string;
  warning: string;
};

type AskSkinAssistantInput = {
  predictedClass: string;
  confidence: number;
  topK: {
    className: string;
    confidence: number;
  }[];
  userQuestion: string;
};

export async function askSkinAssistant({
  predictedClass,
  confidence,
  topK,
  userQuestion,
}: AskSkinAssistantInput): Promise<AssistantResponse> {
  const payload: AssistantRequest = {
    predicted_class: predictedClass,
    confidence,
    top_k: topK.map((item) => ({
      class_name: item.className,
      confidence: item.confidence,
    })),
    user_question: userQuestion.trim(),
  };

  const response = await fetch(`${API_BASE_URL}/assistant`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await getAssistantErrorMessage(response));
  }

  return response.json();
}

async function getAssistantErrorMessage(response: Response) {
  try {
    const data = await response.json();
    if (typeof data.detail === "string") {
      return data.detail;
    }
  } catch {
    // Fall through to the user-friendly default below.
  }

  return "The skin assistant is temporarily unavailable. Please try again later.";
}
