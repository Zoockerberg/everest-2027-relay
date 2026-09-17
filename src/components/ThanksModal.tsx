import type { MouseEvent } from "react";

interface ThanksModalProps {
  detail: string;
  onDone: () => void;
}

export default function ThanksModal({ detail, onDone }: ThanksModalProps) {
  const stop = (e: MouseEvent) => e.stopPropagation();

  return (
    <div className="modal-overlay" onClick={onDone}>
      <div className="modal-panel modal-panel--center" onClick={stop}>
        <div className="modal-panel__title">Thanks — we&rsquo;ll confirm your slot shortly</div>
        <p className="modal-panel__body">{detail}</p>
        <button type="button" onClick={onDone} className="btn btn--done">
          Done
        </button>
      </div>
    </div>
  );
}
