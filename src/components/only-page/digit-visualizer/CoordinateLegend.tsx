import s from "./styles.module.scss";
import { CLASS_COLORS } from "@/constants/model";

const classes = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

export default function CoordinateLegend() {
  return <div className={s.legend}><span className={s.legendTitle}>CLASS</span>{classes.map((digit) => <span className={s.legendItem} key={digit}><i style={{ backgroundColor: CLASS_COLORS[digit] }} />{digit}</span>)}</div>;
}