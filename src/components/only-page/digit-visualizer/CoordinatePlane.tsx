import s from "./styles.module.scss";
import { useMemo } from "react";
import { CLASS_COLORS, STAGE_COORDINATE_KEYS } from "@/constants/model";
import { getCoordinateBounds, mapCoordinateToSvg } from "@/utils/coordinate";
import type { InferenceResult, ModelSample, ModelStage } from "@/types/model";

interface CoordinatePlaneProps {
  activeStage: ModelStage;
  currentInference: InferenceResult | null;
  samples: readonly ModelSample[];
}

export default function CoordinatePlane({ activeStage, currentInference, samples }: CoordinatePlaneProps) {
  const { axisX, axisY, bounds, currentPoint, points } = useMemo(() => {
    const coordinateKey = STAGE_COORDINATE_KEYS[activeStage];
    const coordinates = samples.map((sample) => sample[coordinateKey]);
    const bounds = getCoordinateBounds(coordinates);
    const origin = mapCoordinateToSvg([0, 0], bounds, 100, 100);
    const points = samples.map((sample, index) => ({
      color: CLASS_COLORS[sample.label] ?? "#6c766f",
      key: `${sample.label}-${index}`,
      point: mapCoordinateToSvg(sample[coordinateKey], bounds, 100, 100),
    }));
    const currentCoordinate = currentInference ? currentInference[coordinateKey] : null;

    return {
      axisX: origin.x,
      axisY: origin.y,
      bounds,
      currentPoint: currentCoordinate ? mapCoordinateToSvg(currentCoordinate, bounds, 100, 100) : null,
      points,
    };
  }, [activeStage, currentInference, samples]);

  const hasYAxis = bounds.minX <= 0 && bounds.maxX >= 0;
  const hasXAxis = bounds.minY <= 0 && bounds.maxY >= 0;

  return <div className={s.planeFrame} aria-label={`${activeStage} 좌표평면`}><svg className={s.plane} viewBox="0 0 100 100" role="img"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="#e8eef3" strokeWidth=".35" /></pattern></defs><rect width="100" height="100" fill="url(#grid)" />{hasYAxis && <line x1={axisX} y1="4" x2={axisX} y2="96" className={s.axis} />}{hasXAxis && <line x1="4" y1={axisY} x2="96" y2={axisY} className={s.axis} />}{points.map(({ color, key, point }) => <circle cx={point.x} cy={point.y} fill={color} key={key} r=".7" />)}{currentPoint && <circle className={s.currentPoint} cx={currentPoint.x} cy={currentPoint.y} r="1.8" />}</svg><span className={`${s.axisLabel} ${s.xLabel}`}>x₁</span><span className={`${s.axisLabel} ${s.yLabel}`}>x₂</span></div>;
}
