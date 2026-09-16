import type { InferenceResult } from "@/types/model";

export interface InferenceReference {
  input: number[];
  expected: InferenceResult;
}

export interface InferenceComparison {
  matches: boolean;
  maxAbsoluteError: number;
  mismatches: string[];
}

const vectorFields = ["z0", "z1", "z2", "z3", "logits", "probabilities"] as const;

export function compareInferenceToReference(
  actual: InferenceResult,
  expected: InferenceResult,
  tolerance = 1e-5,
): InferenceComparison {
  const mismatches: string[] = [];
  let maxAbsoluteError = 0;

  for (const field of vectorFields) {
    const actualValues = actual[field];
    const expectedValues = expected[field];
    if (actualValues.length !== expectedValues.length) {
      mismatches.push(`${field}: length ${actualValues.length} !== ${expectedValues.length}`);
      continue;
    }
    actualValues.forEach((value, index) => {
      const error = Math.abs(value - expectedValues[index]);
      maxAbsoluteError = Math.max(maxAbsoluteError, error);
      if (error > tolerance) mismatches.push(`${field}[${index}]: error ${error}`);
    });
  }

  if (actual.prediction !== expected.prediction) mismatches.push(`prediction: ${actual.prediction} !== ${expected.prediction}`);
  const confidenceError = Math.abs(actual.confidence - expected.confidence);
  maxAbsoluteError = Math.max(maxAbsoluteError, confidenceError);
  if (confidenceError > tolerance) mismatches.push(`confidence: error ${confidenceError}`);

  return { matches: mismatches.length === 0, maxAbsoluteError, mismatches };
}