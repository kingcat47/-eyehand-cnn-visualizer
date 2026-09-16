import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent,
} from "react";
import { Eraser, LoaderCircle } from "lucide-react";

import { CLASS_COLORS } from "@/constants/model";
import {
  canvasToV2Input,
  loadV2Assets,
  runV2Inference,
} from "@/model/inferenceV2";
import {
  V2_STAGES,
  type V2InferenceResult,
  type V2ModelData,
  type V2Stage,
} from "@/types/modelV2";
import { getCoordinateBounds, mapCoordinateToSvg } from "@/utils/coordinate";

import s from "./styles.module.scss";

const STAGE_LABELS: Record<V2Stage, string> = {
  embedding: "Embedding",
  linear1: "Linear 1",
  relu1: "ReLU 1",
  linear2: "Linear 2",
  relu2: "ReLU 2",
};

export default function DigitVisualizerV2() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const requestIdRef = useRef(0);
  const inferenceFrameRef = useRef<number | null>(null);
  const inferenceRunningRef = useRef(false);
  const inferencePendingRef = useRef(false);
  const [hasDrawing, setHasDrawing] = useState(false);
  const [activeStage, setActiveStage] = useState<V2Stage>("embedding");
  const [modelData, setModelData] = useState<V2ModelData | null>(null);
  const [inference, setInference] = useState<V2InferenceResult | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "running" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;
    loadV2Assets()
      .then((data) => {
        if (!active) return;
        setModelData(data);
        setStatus("ready");
      })
      .catch((error: unknown) => {
        if (!active) return;
        setErrorMessage(error instanceof Error ? error.message : "모델을 불러오지 못했습니다.");
        setStatus("error");
      });
    return () => {
      active = false;
    };
  }, []);

  const getCanvasPoint = (event: PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const bounds = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - bounds.left) / bounds.width) * canvas.width,
      y: ((event.clientY - bounds.top) / bounds.height) * canvas.height,
    };
  };

  const runScheduledInference = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !modelData || inferenceRunningRef.current) return;
    inferencePendingRef.current = false;
    inferenceRunningRef.current = true;
    const requestId = ++requestIdRef.current;
    setStatus("running");
    try {
      const result = await runV2Inference(canvasToV2Input(canvas), modelData);
      if (requestId !== requestIdRef.current) return;
      setInference(result);
      if (!inferencePendingRef.current) setStatus("ready");
    } catch (error) {
      if (requestId !== requestIdRef.current) return;
      setErrorMessage(error instanceof Error ? error.message : "Model inference failed.");
      setStatus("error");
    } finally {
      inferenceRunningRef.current = false;
      if (inferencePendingRef.current) queueInference();
    }
  };

  const queueInference = () => {
    if (!modelData) return;
    inferencePendingRef.current = true;
    if (inferenceFrameRef.current !== null) return;
    inferenceFrameRef.current = requestAnimationFrame(() => {
      inferenceFrameRef.current = null;
      void runScheduledInference();
    });
  };

  const draw = (event: PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    const canvas = canvasRef.current;
    const point = getCanvasPoint(event);
    if (!canvas || !point) return;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) return;
    context.lineWidth = 15;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.strokeStyle = "#17211c";
    context.lineTo(point.x, point.y);
    context.stroke();
    context.beginPath();
    context.moveTo(point.x, point.y);
    setHasDrawing(true);
    queueInference();
  };

  const startDrawing = (event: PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const point = getCanvasPoint(event);
    if (!canvas || !point) return;
    canvas.setPointerCapture(event.pointerId);
    drawingRef.current = true;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    context?.beginPath();
    context?.moveTo(point.x, point.y);
    draw(event);
  };



  /* Legacy manual-run path removed: inference is now queued from pointer movement. */
  const unusedLegacyBlock = () => {
      const requestId = requestIdRef.current + 1;
      const error = new Error("legacy");
      if (requestId !== requestIdRef.current) return;
      setErrorMessage(error instanceof Error ? error.message : "추론에 실패했습니다.");
      setStatus("error");
    }
  void unusedLegacyBlock;

  const stopDrawing = () => {
    drawingRef.current = false;
    canvasRef.current?.getContext("2d", { willReadFrequently: true })?.closePath();
  };

  const clearDrawing = () => {
    requestIdRef.current += 1;
    inferencePendingRef.current = false;
    if (inferenceFrameRef.current !== null) {
      cancelAnimationFrame(inferenceFrameRef.current);
      inferenceFrameRef.current = null;
    }
    const canvas = canvasRef.current;
    canvas?.getContext("2d", { willReadFrequently: true })?.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawing(false);
    setInference(null);
    if (modelData) setStatus("ready");
  };

 
  return (
    <main className={s.page}>

      {status === "error" && <div className={s.errorBanner}>모델 로딩 오류: {errorMessage}</div>}

      <div className={s.workspace}>
        <section className={s.card} aria-labelledby="v2-drawing-title">
          <div className={s.cardHeader}>
            <div><h2 id="v2-drawing-title">손글씨 입력</h2></div>
           
          </div>
          <div className={s.drawingArea}>
            <div className={s.drawingGrid} />
            <canvas
              aria-label="V2 손글씨 입력 영역"
              className={s.canvas}
              height="280"
              onPointerCancel={stopDrawing}
              onPointerDown={startDrawing}
              onPointerMove={draw}
              onPointerUp={stopDrawing}
              ref={canvasRef}
              width="280"
            />
            {!hasDrawing && <p>여기에 숫자를 그려보세요</p>}
          </div>
          <div className={s.canvasActions}>
            <button onClick={clearDrawing} type="button"><Eraser size={16} />지우기</button>
        
          </div>
          <PredictionSummary inference={inference} />
        </section>

        <section className={`${s.card} ${s.projectionCard}`} aria-labelledby="v2-space-title">
          <div className={s.cardHeader}>
            <div><h2 id="v2-space-title">PCA 투영 공간</h2></div>
        
          </div>
          <div className={s.tabs} role="tablist" aria-label="V2 모델 단계">
            {V2_STAGES.map((stage) => (
              <button
                aria-selected={activeStage === stage}
                className={activeStage === stage ? s.activeTab : ""}
                key={stage}
                onClick={() => setActiveStage(stage)}
                role="tab"
                type="button"
              >
                {STAGE_LABELS[stage]}
              </button>
            ))}
          </div>
          {modelData ? (
            <PcaPlane
              activeStage={activeStage}
              data={modelData}
              inference={inference}
            />
          ) : (
            <div className={s.loadingPanel}><LoaderCircle className={s.spinner} size={24} />PCA 데이터를 불러오는 중입니다.</div>
          )}
        </section>

        <section className={s.card} aria-labelledby="v2-vector-title">
          <div className={s.cardHeader}>
            <div><span>03</span><h2 id="v2-vector-title">실제 벡터</h2></div>
            <small>{STAGE_LABELS[activeStage]}</small>
          </div>
          <ActivationPanel
            activeStage={activeStage}
            data={modelData}
            inference={inference}
          />
        </section>
      </div>
    </main>
  );
}

function PredictionSummary({ inference }: { inference: V2InferenceResult | null }) {
  return (
    <div className={s.predictionSummary}>
      <div><span>현재 예측</span><strong>{inference?.prediction ?? "—"}</strong></div>
      <div><span>신뢰도</span><strong>{inference ? `${(inference.confidence * 100).toFixed(2)}%` : "—"}</strong></div>
    </div>
  );
}

function PcaPlane({
  activeStage,
  data,
  inference,
}: {
  activeStage: V2Stage;
  data: V2ModelData;
  inference: V2InferenceResult | null;
}) {
  const chart = useMemo(() => {
    const coordinates = data.samples.map((sample) => sample.coordinates[activeStage]);
    const bounds = getCoordinateBounds(coordinates);
    const points = data.samples.map((sample) => ({
      color: CLASS_COLORS[sample.label] ?? "#718078",
      point: mapCoordinateToSvg(sample.coordinates[activeStage], bounds, 100, 100),
    }));
    const rawCurrent = inference
      ? mapCoordinateToSvg(inference.coordinates[activeStage], bounds, 100, 100)
      : null;
    const current = rawCurrent ? {
      x: Math.min(96, Math.max(4, rawCurrent.x)),
      y: Math.min(96, Math.max(4, rawCurrent.y)),
    } : null;
    const origin = mapCoordinateToSvg([0, 0], bounds, 100, 100);
    return { bounds, current, origin, points };
  }, [activeStage, data, inference]);

  const hasYAxis = chart.bounds.minX <= 0 && chart.bounds.maxX >= 0;
  const hasXAxis = chart.bounds.minY <= 0 && chart.bounds.maxY >= 0;

  return (
    <>
      <div className={s.planeFrame}>
        <svg aria-label={`${STAGE_LABELS[activeStage]} PCA 좌표평면`} className={s.plane} role="img" viewBox="0 0 100 100">
          <defs><pattern id={`v2-grid-${activeStage}`} width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="#edf1ee" strokeWidth=".3" /></pattern></defs>
          <rect fill={`url(#v2-grid-${activeStage})`} height="100" width="100" />
          {hasYAxis && <line className={s.axis} x1={chart.origin.x} x2={chart.origin.x} y1="4" y2="96" />}
          {hasXAxis && <line className={s.axis} x1="4" x2="96" y1={chart.origin.y} y2={chart.origin.y} />}
          {chart.points.map(({ color, point }, index) => <circle cx={point.x} cy={point.y} fill={color} key={index} opacity=".62" r=".72" />)}
          {chart.current && <><circle className={s.currentRing} cx={chart.current.x} cy={chart.current.y} r="2.8" /><circle className={s.currentPoint} cx={chart.current.x} cy={chart.current.y} r="1.5" /></>}
        </svg>
        <span className={s.pc2}>PC2</span><span className={s.pc1}>PC1</span>
      </div>
      <div className={s.legend}><span>CLASS</span>{Array.from({ length: 10 }, (_, digit) => <i key={digit}><b style={{ background: CLASS_COLORS[digit] }} />{digit}</i>)}{inference && <i><b className={s.youDot} />YOU</i>}</div>
    </>
  );
}

function ActivationPanel({
  activeStage,
  data,
  inference,
}: {
  activeStage: V2Stage;
  data: V2ModelData | null;
  inference: V2InferenceResult | null;
}) {
  if (!data) return <div className={s.loadingPanel}><LoaderCircle className={s.spinner} size={24} />모델을 불러오는 중입니다.</div>;
  if (!inference) return <div className={s.emptyVector}><div className={s.emptyCells}>{Array.from({ length: 32 }, (_, index) => <i key={index} />)}</div><p>숫자를 그리고 분류하면 실제 고차원 activation을 표시합니다.</p></div>;

  const values = inference.activations[activeStage];
  const maximum = Math.max(...values.map((value) => Math.abs(value)), 1e-9);
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const activeCount = values.filter((value) => value > 0).length;

  return (
    <>
      <div className={s.vectorStats}>
        <div><span>DIMENSION</span><strong>{values.length}</strong></div>
        <div><span>ACTIVE</span><strong>{activeCount}</strong></div>
        <div><span>MEAN</span><strong>{mean.toFixed(2)}</strong></div>
      </div>
      <div className={s.heatmap} aria-label={`${values.length}차원 activation 히트맵`}>
        {values.map((value, index) => {
          const strength = Math.abs(value) / maximum;
          const background = value >= 0
            ? `rgba(23, 145, 89, ${0.12 + strength * 0.88})`
            : `rgba(214, 76, 76, ${0.12 + strength * 0.88})`;
          return <i key={index} style={{ background }} title={`뉴런 ${index}: ${value.toFixed(5)}`} />;
        })}
      </div>
      <div className={s.heatLegend}><span><i className={s.negative} />음수</span><span><i className={s.positive} />양수</span></div>
      <div className={s.vectorValues}>
        <p><span>PCA 좌표</span><strong>({inference.coordinates[activeStage][0].toFixed(2)}, {inference.coordinates[activeStage][1].toFixed(2)})</strong></p>
        <p><span>값 범위</span><strong>{Math.min(...values).toFixed(2)} – {Math.max(...values).toFixed(2)}</strong></p>
      </div>
      <div className={s.probabilityTitle}><span>최종 클래스 확률</span><strong>{inference.prediction}</strong></div>
      <div className={s.probabilities}>
        {inference.probabilities.map((probability, digit) => (
          <div className={digit === inference.prediction ? s.probabilityActive : ""} key={digit}>
            <span>{digit}</span><i><b style={{ width: `${probability * 100}%` }} /></i><em>{(probability * 100).toFixed(1)}%</em>
          </div>
        ))}
      </div>
    </>
  );
}
