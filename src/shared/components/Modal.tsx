import type { PropsWithChildren } from "react";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

export type ModalProps = PropsWithChildren<{
  isOpen: boolean;
  onClose?: () => void;
  labelledBy?: string;
  className?: string;
  disableBackdropClose?: boolean;
}>;

const Modal = ({
  isOpen,
  onClose,
  labelledBy,
  className,
  disableBackdropClose,
  children,
}: ModalProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !disableBackdropClose) {
        onClose?.();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [disableBackdropClose, isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const modalRoot = document.body;

  const content = (
    <div className="modal-portal fixed inset-0 z-[1000] flex items-center justify-center px-4">
      <div
        className="modal-backdrop absolute inset-0 bg-black/60"
        onClick={() => {
          if (!disableBackdropClose) onClose?.();
        }}
      />
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className={className ?? "relative z-[1001]"}
      >
        {children}
      </div>
    </div>
  );

  return createPortal(content, modalRoot);
};

export default Modal;
