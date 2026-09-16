import rawModelData from "./model_data_full.json";

import type { Coordinate, ModelData, ModelMetadata, ModelSample, ModelWeightValue } from "@/types/model";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isNumberArray(value: unknown): value is number[] {
  return Array.isArray(value) && value.every((item) => typeof item === "number");
}

function isCoordinate(value: unknown): value is Coordinate {
  return isNumberArray(value) && value.length === 2;
}

function isWeightValue(value: unknown): value is ModelWeightValue {
  return isNumberArray(value) || (Array.isArray(value) && value.every(isNumberArray));
}

function isModelSample(value: unknown): value is ModelSample {
  return isRecord(value)
    && typeof value.label === "number"
    && typeof value.prediction === "number"
    && isCoordinate(value.z0)
    && isCoordinate(value.z1)
    && isCoordinate(value.z2)
    && isCoordinate(value.z3);
}

function isModelMetadata(value: unknown): value is ModelMetadata {
  if (!isRecord(value) || typeof value.dataset !== "string" || typeof value.sampleCount !== "number" || typeof value.accuracy !== "number" || !isRecord(value.stages)) {
    return false;
  }

  return value.stages.embedding === "z0"
    && value.stages.linear1 === "z1"
    && value.stages.relu === "z2"
    && value.stages.linear2 === "z3";
}

function parseModelData(value: unknown): ModelData {
  if (!isRecord(value) || !isModelMetadata(value.metadata) || !isRecord(value.weights) || !Array.isArray(value.samples)) {
    throw new Error("model_data_full.json has an invalid top-level shape");
  }

  const weights = Object.fromEntries(
    Object.entries(value.weights).filter(([, weight]) => isWeightValue(weight)),
  ) as Record<string, ModelWeightValue>;

  if (Object.keys(weights).length !== Object.keys(value.weights).length || !value.samples.every(isModelSample)) {
    throw new Error("model_data_full.json contains an invalid weight or sample shape");
  }

  return { metadata: value.metadata, weights, samples: value.samples };
}

export const modelData = parseModelData(rawModelData);