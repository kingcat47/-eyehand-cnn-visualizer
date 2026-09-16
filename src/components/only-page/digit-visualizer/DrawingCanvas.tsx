import { useRef, useState, type PointerEvent } from "react";
import { Eraser } from "lucide-react";

import { Button } from "@/components/ui";
import { canvasToModelInput, runInference } from "@/model/inference";
import type { InferenceResult } from "@/types/model";

import s from "./styles.module.scss";

interface DrawingCanvasProps {
  inference: InferenceResult | null;
  onCheckResult: () => void;
  onInferenceChange: (result: InferenceResult | null) => void;
}

export default function DrawingCanvas({ inference, onCheckResult, onInferenceChange }: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const inferenceFrameRef = useRef<number | null>(null);
  const [hasDrawing, setHasDrawing] = useState(false);

  const scheduleInference = () => {
    if (inferenceFrameRef.current !== null) return;
    inferenceFrameRef.current = requestAnimationFrame(() => {
      inferenceFrameRef.current = null;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const input = canvasToModelInput(canvas);
      onInferenceChange(runInference(input));
    });
  };

  const getCanvasPoint = (event: PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const bounds = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - bounds.left) / bounds.width) * canvas.width,
      y: ((event.clientY - bounds.top) / bounds.height) * canvas.height,
    };
  };

  const draw = (event: PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const point = getCanvasPoint(event);
    if (!canvas || !point || !isDrawingRef.current) return;

    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) return;
    context.lineWidth = 14;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.strokeStyle = "#202522";
    context.lineTo(point.x, point.y);
    context.stroke();
    context.beginPath();
    context.moveTo(point.x, point.y);
    setHasDrawing(true);
    scheduleInference();
  };

  const startDrawing = (event: PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const point = getCanvasPoint(event);
    if (!canvas || !point) return;
    canvas.setPointerCapture(event.pointerId);
    isDrawingRef.current = true;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    context?.beginPath();
    context?.moveTo(point.x, point.y);
    draw(event);
  };

  const stopDrawing = () => {
    isDrawingRef.current = false;
    canvasRef.current?.getContext("2d", { willReadFrequently: true })?.closePath();
  };

  const clearDrawing = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.getContext("2d", { willReadFrequently: true })?.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawing(false);
    if (inferenceFrameRef.current !== null) cancelAnimationFrame(inferenceFrameRef.current);
    inferenceFrameRef.current = null;
    onInferenceChange(null);
  };

  return (
    <section className={s.panel} aria-labelledby="drawing-title">
      <div className={s.panelHeader}><h2 id="drawing-title">손글씨 입력</h2></div>
      <div className={s.drawingArea}><div className={s.drawingGrid} /><canvas aria-label="손글씨 입력 영역" className={s.drawingCanvas} height="280" onPointerCancel={stopDrawing} onPointerDown={startDrawing} onPointerMove={draw} onPointerUp={stopDrawing} ref={canvasRef} width="280" /><div className={`${s.drawingHint} ${hasDrawing ? s.hiddenHint : ""}`}><p>여기에 숫자를 그려보세요</p></div></div>
      <div className={s.canvasActions}><Button className={s.clearButton} leadingIcon={<Eraser size={16} />} onClick={clearDrawing} variant="secondary">지우기</Button><Button className={s.checkButton} onClick={onCheckResult} variant="primary">결과 확인</Button></div>
      <div className={s.prediction}><div><span>현재 예측</span><strong>{inference ? inference.prediction : "-"}</strong></div><div><span>신뢰도</span><strong>{inference ? `${(inference.confidence * 100).toFixed(2)}%` : "-"}</strong></div></div>
    </section>
  );
}