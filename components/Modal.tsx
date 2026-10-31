import { useEffect, type ReactNode } from 'react';

interface Props {
  title: string;
  onClose?: () => void;
  children: ReactNode;
  width?: number;
}

export default function Modal({ title, onClose, children, width }: Props) {
  useEffect(() => {
    if (!onClose) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label={title}>
      <div className="modal panel" style={width ? { width: `min(${width}px, 100%)` } : undefined}>
        <div className="modal-head">
          <h2>{title}</h2>
          {onClose && (
            <button id="modal-close" className="btn btn-ghost btn-icon" onClick={onClose} aria-label="닫기">
              ✕
            </button>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}
