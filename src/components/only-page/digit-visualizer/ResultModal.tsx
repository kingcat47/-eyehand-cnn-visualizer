import { Modal } from "@/components/ui";
import type { InferenceResult } from "@/types/model";

import s from "./styles.module.scss";

interface ResultModalProps { inference: InferenceResult | null; isOpen: boolean; onClose: () => void; }

export default function ResultModal({ inference, isOpen, onClose }: ResultModalProps) {
  return <Modal isOpen={isOpen} onClose={onClose} title="분류 결과">{inference ? <><div className={s.resultHero}><span>예측 숫자</span><strong>{inference.prediction}</strong><div><span>신뢰도</span><b>{formatPercentage(inference.confidence)}</b></div></div><div className={s.probabilities}>{inference.probabilities.map((probability, digit) => <div className={digit === inference.prediction ? s.probabilityActive : s.probability} key={digit}><span>{digit}</span><div><i style={{ width: `${probability * 100}%` }} /></div><b>{formatPercentage(probability)}</b></div>)}</div><div className={s.finalPosition}><span>최종 2D 좌표</span><strong>({inference.z3[0].toFixed(2)}, {inference.z3[1].toFixed(2)})</strong></div></> : <p className={s.emptyResult}>먼저 숫자를 그려주세요.</p>}</Modal>;
}

function formatPercentage(value: number): string {
  return `${(value * 100).toFixed(2)}%`;
}