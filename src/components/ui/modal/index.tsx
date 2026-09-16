import { X } from "lucide-react";
import type { ReactNode } from "react";

import s from "./styles.module.scss";

interface ModalProps {
  children: ReactNode;
  title: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function Modal({ children, title, isOpen, onClose }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className={s.backdrop} onClick={onClose} role="presentation">
      <section
        aria-labelledby="modal-title"
        aria-modal="true"
        className={s.modal}
        role="dialog"
        onClick={(event) => event.stopPropagation()}
      >
        <div className={s.header}>
          <h2 id="modal-title">{title}</h2>
          <button aria-label="닫기" className={s.closeButton} onClick={onClose} type="button">
            <X size={18} />
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}