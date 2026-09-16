import type { ReactNode } from "react";

import s from "./styles.module.scss";

interface MathVariableProps {
  children: ReactNode;
  subscript?: ReactNode;
  superscript?: ReactNode;
}

export default function MathVariable({ children, subscript, superscript }: MathVariableProps) {
  return <span className={s.mathVariable}>{children}{subscript !== undefined && <sub className={s.subscript}>{subscript}</sub>}{superscript !== undefined && <sup className={s.superscript}>{superscript}</sup>}</span>;
}
