export const V2_STAGES = [
  "embedding",
  "linear1",
  "relu1",
  "linear2",
  "relu2",
] as const;

export type V2Stage = (typeof V2_STAGES)[number];
export type V2Coordinate = readonly [number, number];

export interface V2PcaProjection {
  inputDimension: number;
  mean: number[];
  components: [number[], number[]];
  explainedVarianceRatio: [number, number];
  totalExplainedVariance: number;
}

export interface V2Sample {
  datasetIndex: number;
  label: number;
  prediction: number;
  coordinates: Record<V2Stage, V2Coordinate>;
}

export interface V2ModelData {
  formatVersion: number;
  metadata: {
    dataset: string;
    testSampleCount: number;
    displaySampleCount: number;
    accuracy: number;
    projection: "PCA";
    pcaFitSampleCount: number;
    classifierUsesProjection: false;
    activationDimensions: Record<V2Stage, number>;
    stages: V2Stage[];
  };
  pca: Record<V2Stage, V2PcaProjection>;
  samples: V2Sample[];
}

export interface V2InferenceResult {
  logits: number[];
  probabilities: number[];
  prediction: number;
  confidence: number;
  activations: Record<V2Stage, number[]>;
  coordinates: Record<V2Stage, V2Coordinate>;
}
