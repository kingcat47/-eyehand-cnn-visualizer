import type { InferenceResult, ModelStage } from "@/types/model";
import { modelData } from "@/data/model";

import CoordinateLegend from "./CoordinateLegend";
import CoordinatePlane from "./CoordinatePlane";
import StageTabs from "./StageTabs";
import s from "./styles.module.scss";

interface LatentSpacePanelProps { activeStage: ModelStage; inference: InferenceResult | null; onStageChange: (stage: ModelStage) => void; }

export default function LatentSpacePanel({ activeStage, inference, onStageChange }: LatentSpacePanelProps) {
  return <section className={`${s.panel} ${s.spacePanel}`} aria-labelledby="space-title"><div className={s.panelHeader}><h2 id="space-title">모델 내부 공간</h2></div><StageTabs activeStage={activeStage} onStageChange={onStageChange} /><CoordinatePlane activeStage={activeStage} currentInference={inference} samples={modelData.samples} /><CoordinateLegend /></section>;
}