export function runFakeInference() {
  return {
    topClass: "Melanoma",
    confidence: 0.924,
    topK: [
      {
        className: "Melanoma",
        confidence: 0.924,
      },
      {
        className: "Melanocytic Nevi (NV)",
        confidence: 0.051,
      },
      {
        className: "Benign Keratosis-like Lesions (BKL)",
        confidence: 0.018,
      },
    ],
  };
}