import type { ChangeEvent, MouseEvent } from "react";
import { useLanguage } from "../i18n/LanguageContext";

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
  const { t } = useLanguage();
  const stop = (e: MouseEvent) => e.stopPropagation();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" onClick={stop}>
        <div className="modal-panel__header">
          <div>
            <div className="modal-panel__title">{t.modalTitle}</div>
            <div className="modal-panel__selection">
              {t.joining} {selectionLabel}
            </div>
          </div>
          <button type="button" onClick={onClose} className="modal-close" aria-label="Close">
            ×
          </button>
        </div>

        <div className="modal-fields">
          <input
            value={name}
            onChange={onChangeName}
            placeholder={t.fullNamePlaceholder}
            className="text-input"
          />
          <input
            value={phone}
            onChange={onChangePhone}
            placeholder={t.phonePlaceholder}
            type="tel"
            className="text-input"
          />
          <button
            type="button"
            onClick={onSubmit}
            disabled={submitDisabled}
            className={`btn btn--confirm${submitDisabled ? " btn--confirm-disabled" : ""}`}
          >
            {t.confirm}
          </button>
          <div className="modal-fineprint">{t.modalFineprint}</div>
        </div>
      </div>
    </div>
  );
}
