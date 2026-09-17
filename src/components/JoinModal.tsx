import type { ChangeEvent, MouseEvent } from "react";

interface JoinModalProps {
  selectionLabel: string;
  name: string;
  phone: string;
  onChangeName: (e: ChangeEvent<HTMLInputElement>) => void;
  onChangePhone: (e: ChangeEvent<HTMLInputElement>) => void;
  onClose: () => void;
  onSubmit: () => void;
  submitDisabled: boolean;
}

export default function JoinModal({
  selectionLabel,
  name,
  phone,
  onChangeName,
  onChangePhone,
  onClose,
  onSubmit,
  submitDisabled,
}: JoinModalProps) {
  const stop = (e: MouseEvent) => e.stopPropagation();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" onClick={stop}>
        <div className="modal-panel__header">
          <div>
            <div className="modal-panel__title">Join this slot</div>
            <div className="modal-panel__selection">Joining {selectionLabel}</div>
          </div>
          <button type="button" onClick={onClose} className="modal-close" aria-label="Close">
            ×
          </button>
        </div>

        <div className="modal-fields">
          <input
            value={name}
            onChange={onChangeName}
            placeholder="Full name"
            className="text-input"
          />
          <input
            value={phone}
            onChange={onChangePhone}
            placeholder="Phone number"
            type="tel"
            className="text-input"
          />
          <button
            type="button"
            onClick={onSubmit}
            disabled={submitDisabled}
            className={`btn btn--confirm${submitDisabled ? " btn--confirm-disabled" : ""}`}
          >
            Confirm
          </button>
          <div className="modal-fineprint">
            Your phone number is for the organiser only and is never shown on the page. Joining
            creates a pending registration for that hour.
          </div>
        </div>
      </div>
    </div>
  );
}
