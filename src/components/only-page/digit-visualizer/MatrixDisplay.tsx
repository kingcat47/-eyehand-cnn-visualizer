import s from "./styles.module.scss";
import type { ReactNode } from "react";

interface MatrixDisplayProps { label: ReactNode; rows: string[][]; }

export default function MatrixDisplay({ label, rows }: MatrixDisplayProps) {
  return <div className={s.matrix}><span>{label} =</span><div className={s.matrixValues}>{rows.map((row, rowIndex) => <div key={rowIndex}>{row.map((value, valueIndex) => <code key={`${value}-${valueIndex}`}>{value}</code>)}</div>)}</div></div>;
}