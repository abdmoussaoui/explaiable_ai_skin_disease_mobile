export function softmax(logits: number[]): number[] {
  const maxLogit = Math.max(...logits);

  const exps = logits.map((value) => Math.exp(value - maxLogit));
  const sum = exps.reduce((acc, value) => acc + value, 0);

  return exps.map((value) => value / sum);
}

export function getTopK(probabilities: number[], k: number) {
  return probabilities
    .map((confidence, index) => ({
      classId: index,
      confidence,
    }))
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, k);
}