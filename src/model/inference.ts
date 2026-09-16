import { modelData } from "@/data/model";
import type { Coordinate, InferenceResult, ModelWeights } from "@/types/model";

type Matrix = number[][];
type Vector = number[];

function isMatrix(value: number[] | number[][]): value is Matrix {
  return Array.isArray(value) && (value.length === 0 || Array.isArray(value[0]));
}

function getVector(weights: ModelWeights, key: string): Vector {
  const value = weights[key];
  if (!value || isMatrix(value)) throw new Error(`Expected vector weight: ${key}`);
  return value;
}

function getMatrix(weights: ModelWeights, key: string): Matrix {
  const value = weights[key];
  if (!value || !isMatrix(value)) throw new Error(`Expected matrix weight: ${key}`);
  return value;
}

function toCoordinate(values: Vector, name: string): Coordinate {
  if (values.length !== 2) throw new Error(`Expected ${name} to have two values`);
  return [values[0] ?? 0, values[1] ?? 0];
}

export function linear(input: readonly number[], weight: Matrix, bias: Vector): Vector {
  return weight.map((row, outputIndex) => {
    const sum = row.reduce((total, weightValue, inputIndex) => total + weightValue * (input[inputIndex] ?? 0), 0);
    return sum + (bias[outputIndex] ?? 0);
  });
}

export function relu(input: readonly number[]): Vector {
  return input.map((value) => Math.max(0, value));
}

export function softmax(logits: readonly number[]): Vector {
  const maximum = Math.max(...logits);
  const exponentials = logits.map((value) => Math.exp(value - maximum));
  const total = exponentials.reduce((sum, value) => sum + value, 0);
  return exponentials.map((value) => value / total);
}

function argmax(values: readonly number[]): number {
  return values.reduce((bestIndex, value, index) => value > values[bestIndex] ? index : bestIndex, 0);
}

export function runInference(input: readonly number[], weights: ModelWeights = modelData.weights): InferenceResult {
  if (input.length !== 784) throw new Error(`Expected 784 input values, received ${input.length}`);

  const encoder1 = relu(linear(input, getMatrix(weights, "encoder.1.weight"), getVector(weights, "encoder.1.bias")));
  const encoder2 = relu(linear(encoder1, getMatrix(weights, "encoder.3.weight"), getVector(weights, "encoder.3.bias")));
  const z0 = toCoordinate(linear(encoder2, getMatrix(weights, "encoder.5.weight"), getVector(weights, "encoder.5.bias")), "z0");
  const z1 = toCoordinate(linear(z0, getMatrix(weights, "linear1.weight"), getVector(weights, "linear1.bias")), "z1");
  const z2 = toCoordinate(relu(z1), "z2");
  const z3 = toCoordinate(linear(z2, getMatrix(weights, "linear2.weight"), getVector(weights, "linear2.bias")), "z3");
  const logits = linear(z3, getMatrix(weights, "classifier.weight"), getVector(weights, "classifier.bias"));
  const probabilities = softmax(logits);
  const prediction = argmax(probabilities);

  return { z0, z1, z2, z3, logits, probabilities, prediction, confidence: probabilities[prediction] ?? 0 };
}

export function canvasToModelInput(canvas: HTMLCanvasElement): number[] {
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return [];
  const image = context.getImageData(0, 0, canvas.width, canvas.height);
  const alpha = new Float32Array(canvas.width * canvas.height);
  for (let index = 0; index < alpha.length; index += 1) {
    alpha[index] = image.data[index * 4 + 3] / 255;
  }
  return normalizeCanvasAlpha(alpha, canvas.width, canvas.height);
}

export function normalizeCanvasAlpha(alpha: ArrayLike<number>, width: number, height: number): number[] {
  const bounds = getInkBounds(alpha, width, height);
  if (!bounds) return new Array<number>(28 * 28).fill(0);

  const targetSize = 20;
  const cropWidth = bounds.maxX - bounds.minX + 1;
  const cropHeight = bounds.maxY - bounds.minY + 1;
  const scale = targetSize / Math.max(cropWidth, cropHeight);
  const output = new Array<number>(28 * 28).fill(0);
  const resizedWidth = cropWidth * scale;
  const resizedHeight = cropHeight * scale;
  const offsetX = (28 - resizedWidth) / 2;
  const offsetY = (28 - resizedHeight) / 2;

  for (let row = 0; row < 28; row += 1) {
    for (let column = 0; column < 28; column += 1) {
      const sourceX = (column + 0.5 - offsetX) / scale + bounds.minX;
      const sourceY = (row + 0.5 - offsetY) / scale + bounds.minY;
      output[row * 28 + column] = sampleAlpha(alpha, width, height, sourceX, sourceY);
    }
  }

  return output;
}

interface InkBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

function getInkBounds(alpha: ArrayLike<number>, width: number, height: number): InkBounds | null {
  const threshold = 0.02;
  let minX = width;
  let maxX = -1;
  let minY = height;
  let maxY = -1;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if ((alpha[y * width + x] ?? 0) <= threshold) continue;
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    }
  }

  return maxX < minX || maxY < minY ? null : { minX, maxX, minY, maxY };
}

function sampleAlpha(alpha: ArrayLike<number>, width: number, height: number, x: number, y: number): number {
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