import * as ort from "onnxruntime-web/wasm";

import {
  V2_STAGES,
  type V2Coordinate,
  type V2InferenceResult,
  type V2ModelData,
  type V2PcaProjection,
  type V2Stage,
} from "@/types/modelV2";

const publicAsset = (name: string) => `${import.meta.env.BASE_URL}model/${name}`;

ort.env.wasm.numThreads = 1;
ort.env.wasm.wasmPaths = {
  wasm: new URL(publicAsset("ort-wasm-simd-threaded.wasm"), window.location.href).href,
};

let sessionPromise: Promise<ort.InferenceSession> | null = null;
let dataPromise: Promise<V2ModelData> | null = null;

function getSession(): Promise<ort.InferenceSession> {
  sessionPromise ??= ort.InferenceSession.create(
    publicAsset("digit_model_v2.onnx"),
    {
      executionProviders: ["wasm"],
      graphOptimizationLevel: "all",
    },
  );
  return sessionPromise;
}

async function getModelData(): Promise<V2ModelData> {
  dataPromise ??= fetch(publicAsset("model_data_v2.json"))
    .then((response) => {
      if (!response.ok) throw new Error(`PCA data request failed: ${response.status}`);
      return response.json() as Promise<V2ModelData>;
    })
    .then((data) => {
      if (data.formatVersion !== 2 || data.metadata.projection !== "PCA") {
        throw new Error("Unsupported V2 visualization data");
      }
      return data;
    });
  return dataPromise;
}

export async function loadV2Assets(): Promise<V2ModelData> {
  const [data] = await Promise.all([getModelData(), getSession()]);
  return data;
}

function tensorValues(
  outputs: ort.InferenceSession.OnnxValueMapType,
  name: string,
): number[] {
  const value = outputs[name];
  if (!value || !("data" in value)) throw new Error(`Missing ONNX output: ${name}`);
  return Array.from(value.data as ArrayLike<number>);
}

function softmax(logits: readonly number[]): number[] {
  const maximum = Math.max(...logits);
  const exponentials = logits.map((value) => Math.exp(value - maximum));
  const total = exponentials.reduce((sum, value) => sum + value, 0);
  return exponentials.map((value) => value / total);
}

function projectPca(
  values: readonly number[],
  projection: V2PcaProjection,
): V2Coordinate {
  if (values.length !== projection.inputDimension) {
    throw new Error(
      `PCA input mismatch: expected ${projection.inputDimension}, received ${values.length}`,
    );
  }
  const coordinates = projection.components.map((component) =>
    component.reduce(
      (sum, weight, index) => sum + weight * (values[index] - projection.mean[index]),
      0,
    ),
  );
  return [coordinates[0] ?? 0, coordinates[1] ?? 0];
}

export async function runV2Inference(
  input: readonly number[],
  data: V2ModelData,
): Promise<V2InferenceResult> {
  if (input.length !== 784) {
    throw new Error(`Expected 784 input values, received ${input.length}`);
  }
  const session = await getSession();
  const outputs = await session.run({
    images: new ort.Tensor("float32", Float32Array.from(input), [1, 1, 28, 28]),
  });
  const logits = tensorValues(outputs, "logits");
  const activations = Object.fromEntries(
    V2_STAGES.map((stage) => [stage, tensorValues(outputs, stage)]),
  ) as Record<V2Stage, number[]>;
  const probabilities = softmax(logits);
  const prediction = probabilities.reduce(
    (best, value, index) => value > probabilities[best] ? index : best,
    0,
  );
  const coordinates = Object.fromEntries(
    V2_STAGES.map((stage) => [stage, projectPca(activations[stage], data.pca[stage])]),
  ) as Record<V2Stage, V2Coordinate>;

  return {
    logits,
    probabilities,
    prediction,
    confidence: probabilities[prediction] ?? 0,
    activations,
    coordinates,
  };
}

export function canvasToV2Input(canvas: HTMLCanvasElement): number[] {
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return new Array(784).fill(0);
  const image = context.getImageData(0, 0, canvas.width, canvas.height);
  const alpha = new Float32Array(canvas.width * canvas.height);
  for (let index = 0; index < alpha.length; index += 1) {
    alpha[index] = image.data[index * 4 + 3] / 255;
  }
  return normalizeAlpha(alpha, canvas.width, canvas.height);
}

function normalizeAlpha(alpha: ArrayLike<number>, width: number, height: number): number[] {
  let minX = width;
  let maxX = -1;
  let minY = height;
  let maxY = -1;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if ((alpha[y * width + x] ?? 0) <= 0.02) continue;
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    }
  }
  if (maxX < minX || maxY < minY) return new Array(784).fill(0);

  const cropWidth = maxX - minX + 1;
  const cropHeight = maxY - minY + 1;
  const scale = 20 / Math.max(cropWidth, cropHeight);
  const resizedWidth = cropWidth * scale;
  const resizedHeight = cropHeight * scale;
  const offsetX = (28 - resizedWidth) / 2;
  const offsetY = (28 - resizedHeight) / 2;
  const output = new Array<number>(784).fill(0);

  for (let row = 0; row < 28; row += 1) {
    for (let column = 0; column < 28; column += 1) {
      const sourceX = (column + 0.5 - offsetX) / scale + minX;
      const sourceY = (row + 0.5 - offsetY) / scale + minY;
      output[row * 28 + column] = bilinearSample(
        alpha,
        width,
        height,
        sourceX,
        sourceY,
      );
    }
  }
  return output;
}

function bilinearSample(
  alpha: ArrayLike<number>,
  width: number,
  height: number,
  x: number,
  y: number,
): number {
  if (x < 0 || y < 0 || x >= width - 1 || y >= height - 1) return 0;
  const left = Math.floor(x);
  const top = Math.floor(y);
  const horizontal = x - left;
  const vertical = y - top;
  const topLeft = alpha[top * width + left] ?? 0;
  const topRight = alpha[top * width + left + 1] ?? 0;
  const bottomLeft = alpha[(top + 1) * width + left] ?? 0;
  const bottomRight = alpha[(top + 1) * width + left + 1] ?? 0;
  const topValue = topLeft + (topRight - topLeft) * horizontal;
  const bottomValue = bottomLeft + (bottomRight - bottomLeft) * horizontal;
  return topValue + (bottomValue - topValue) * vertical;
}
