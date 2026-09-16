import type { ModelStage } from ".";
import { MODEL_STAGES } from "@/constants/model";

import s from "./styles.module.scss";

interface StageTabsProps { activeStage: ModelStage; onStageChange: (stage: ModelStage) => void; }

export default function StageTabs({ activeStage, onStageChange }: StageTabsProps) {
  return <div className={s.tabs} role="tablist" aria-label="모델 단계">{MODEL_STAGES.map((stage) => <button aria-selected={activeStage === stage} className={activeStage === stage ? s.activeTab : ""} key={stage} onClick={() => onStageChange(stage)} role="tab" type="button">{stage}</button>)}</div>;
}