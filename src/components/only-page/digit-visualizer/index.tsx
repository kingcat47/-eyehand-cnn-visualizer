import { useState } from "react";
import { Link } from "react-router-dom";

import DrawingCanvas from "./DrawingCanvas";
import LatentSpacePanel from "./LatentSpacePanel";
import OperationPanel from "./OperationPanel";
import ResultModal from "./ResultModal";
import s from "./styles.module.scss";

import type { ModelStage } from "@/types/model";
import type { InferenceResult } from "@/types/model";

export type { ModelStage } from "@/types/model";

export default function DigitVisualizer() {
  const [activeStage, setActiveStage] = useState<ModelStage>("Linear 1");
  const [isResultOpen, setIsResultOpen] = useState(false);
  const [inference, setInference] = useState<InferenceResult | null>(null);

  return (
    <main className={s.page}>
      <header className={s.topbar}>
        <h1>Eyehand</h1>
        <Link className={s.versionLink} to="/v2">V2 · CNN + PCA 보기</Link>
      </header>
      <div className={s.workspace}>
        <DrawingCanvas inference={inference} onCheckResult={() => setIsResultOpen(true)} onInferenceChange={setInference} />
        <LatentSpacePanel activeStage={activeStage} inference={inference} onStageChange={setActiveStage} />
          <OperationPanel activeStage={activeStage} inference={inference} />
      </div>
      <footer className={s.footer}>손글씨 인식 모델의 내부 표현을 단계별로 살펴보세요</footer>
      <ResultModal inference={inference} isOpen={isResultOpen} onClose={() => setIsResultOpen(false)} />
    </main>
  );
}
