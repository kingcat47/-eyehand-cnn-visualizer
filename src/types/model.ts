export type Coordinate = readonly [number, number];

export type ModelStage = "Embedding" | "Linear 1" | "ReLU" | "Linear 2";

export interface ModelSample {
  label: number;
  prediction: number;
  z0: Coordinate;
  z1: Coordinate;
  z2: Coordinate;
  z3: Coordinate;
}

export type ModelWeightValue = number[] | number[][];

export type ModelWeights = Record<string, ModelWeightValue>;

export interface ModelMetadata {
  dataset: string;
  sampleCount: number;
  accuracy: number;
  stages: {
    embedding: "z0";
    linear1: "z1";
    relu: "z2";
    linear2: "z3";
  };
}

export interface ModelData {
  weights: ModelWeights;
  samples: ModelSample[];
  metadata: ModelMetadata;
}

export interface InferenceResult {
  z0: Coordinate;
  z1: Coordinate;
  z2: Coordinate;
  z3: Coordinate;
  logits: number[];
  probabilities: number[];
  prediction: number;
  confidence: number;
}