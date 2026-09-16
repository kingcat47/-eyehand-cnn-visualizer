import { modelData } from "@/data/model";
import type { InferenceResult, ModelStage } from "@/types/model";
import { formatNumber } from "@/utils/format";

import MatrixDisplay from "./MatrixDisplay";
import MathVariable from "./MathVariable";
import s from "./styles.module.scss";

interface OperationPanelProps {
  activeStage: ModelStage;
  inference: InferenceResult | null;
}

type Matrix = number[][];
type Vector = number[];

export default function OperationPanel({ activeStage, inference }: OperationPanelProps) {
  return (
    <section className={s.panel} aria-labelledby="operation-title">
      <div className={s.panelHeader}><h2 id="operation-title">현재 연산</h2></div>
      {inference ? <OperationContent activeStage={activeStage} inference={inference} /> : <p className={s.emptyOperation}>숫자를 그리면 계산 과정이 표시됩니다.</p>}
    </section>
  );
}

function OperationContent({ activeStage, inference }: { activeStage: ModelStage; inference: InferenceResult }) {
  if (activeStage === "Embedding") return <EmbeddingOperation inference={inference} />;
  if (activeStage === "ReLU") return <ReluOperation inference={inference} />;
  const isLinearOne = activeStage === "Linear 1";
  const input = isLinearOne ? inference.z0 : inference.z2;
  const output = isLinearOne ? inference.z1 : inference.z3;
  const layerName = isLinearOne ? "linear1" : "linear2";
  const layerNumber = isLinearOne ? "1" : "2";
  const weight = getMatrix(`${layerName}.weight`);
  const bias = getVector(`${layerName}.bias`);

  return <><div className={s.expression}><strong><MathVariable>z</MathVariable><sub>{layerNumber}</sub> = <MathVariable>W</MathVariable><sub>{layerNumber}</sub><MathVariable>z</MathVariable><sub>{isLinearOne ? "0" : "2"}</sub> + <MathVariable>b</MathVariable><sub>{layerNumber}</sub></strong></div><div className={s.mathDetails}><MatrixDisplay label={<><MathVariable>W</MathVariable><sub>{layerNumber}</sub></>} rows={weight.map((row) => row.map((value) => formatNumber(value)))} /><MatrixDisplay label={<><MathVariable>z</MathVariable><sub>{isLinearOne ? "0" : "2"}</sub></>} rows={input.map((value) => [formatNumber(value)])} /><MatrixDisplay label={<><MathVariable>b</MathVariable><sub>{layerNumber}</sub></>} rows={bias.map((value) => [formatNumber(value)])} /><CalculationRows input={input} weight={weight} bias={bias} output={output} resultLabel={layerNumber} /><MatrixDisplay label={<><MathVariable>z</MathVariable><sub>{layerNumber}</sub></>} rows={output.map((value) => [formatNumber(value)])} /></div><p className={s.description}>{isLinearOne ? "행렬 W₁은 좌표 공간을 변형하고, b₁은 변환된 좌표를 평행이동시킵니다." : "행렬 W₂는 ReLU 이후의 좌표 공간을 다시 선형변환합니다."}</p></>;
}

function EmbeddingOperation({ inference }: { inference: InferenceResult }) {
  return <><div className={s.expression}><strong><MathVariable>z</MathVariable><sub>0</sub> = Encoder(x)</strong></div><div className={s.mathDetails}><p><span>입력 이미지</span><code>28 × 28 grayscale → 784-dimensional vector</code></p><p className={s.encoderFlow}><span>Encoder structure</span><code>784 → 128 → ReLU → 32 → ReLU → 2</code></p><MatrixDisplay label={<><MathVariable>z</MathVariable><sub>0</sub></>} rows={inference.z0.map((value) => [formatNumber(value)])} /></div><p className={s.description}>Encoder가 손글씨 이미지를 2차원 embedding 좌표로 압축합니다.</p></>;
}

function ReluOperation({ inference }: { inference: InferenceResult }) {
  return <><div className={s.expression}><strong><MathVariable>z</MathVariable><sub>2</sub> = ReLU(<MathVariable>z</MathVariable><sub>1</sub>)</strong></div><div className={s.mathDetails}><MatrixDisplay label={<><MathVariable>z</MathVariable><sub>1</sub></>} rows={inference.z1.map((value) => [formatNumber(value)])} /><div className={s.reluSteps}>{inference.z1.map((value, index) => <code key={index}>ReLU({formatNumber(value)}) = max(0, {formatNumber(value)}) = {formatNumber(inference.z2[index] ?? 0)}</code>)}</div><MatrixDisplay label={<><MathVariable>z</MathVariable><sub>2</sub></>} rows={inference.z2.map((value) => [formatNumber(value)])} /></div><p className={s.description}>ReLU는 음수 성분을 0으로 만들고 양수 성분은 그대로 통과시킵니다.</p></>;
}

function CalculationRows({ input, weight, bias, output, resultLabel }: { input: readonly number[]; weight: Matrix; bias: Vector; output: readonly number[]; resultLabel: string }) {
  return <div className={s.calculations}><span>성분별 계산</span>{output.map((value, index) => <code key={index}><MathVariable>z</MathVariable><sub>{resultLabel}</sub><sub>{index === 0 ? "x" : "y"}</sub> = {formatNumber(weight[index]?.[0] ?? 0)} × {formatNumber(input[0] ?? 0)} + {formatNumber(weight[index]?.[1] ?? 0)} × {formatNumber(input[1] ?? 0)} + {formatNumber(bias[index] ?? 0)} = {formatNumber(value)}</code>)}</div>;
}

function getMatrix(key: string): Matrix {
  const value = modelData.weights[key];
  if (!Array.isArray(value) || value.length === 0 || !Array.isArray(value[0])) throw new Error(`Expected matrix weight: ${key}`);
  return value as Matrix;
}

function getVector(key: string): Vector {
  const value = modelData.weights[key];
  if (!Array.isArray(value) || (value.length > 0 && Array.isArray(value[0]))) throw new Error(`Expected vector weight: ${key}`);
  return value as Vector;
}