import type { ModelStage } from "@/types/model";

export const MODEL_STAGES: readonly ModelStage[] = ["Embedding", "Linear 1", "ReLU", "Linear 2"];

export const STAGE_COORDINATE_KEYS: Record<ModelStage, "z0" | "z1" | "z2" | "z3"> = {
  Embedding: "z0",
  "Linear 1": "z1",
  ReLU: "z2",
  "Linear 2": "z3",
};

export const CLASS_COLORS: Record<number, string> = {
  0: "#1f77b4",
  1: "#ff7f0e",
  2: "#2ca02c",
  3: "#d62728",
  4: "#9467bd",
  5: "#8c564b",
  6: "#e377c2",
  7: "#7f7f7f",
  8: "#bcbd22",
  9: "#17becf",
};