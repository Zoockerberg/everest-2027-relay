import type { MouseEvent } from "react";
import { useLanguage } from "../i18n/LanguageContext";
import { selectionLabel } from "../lib/schedule";

interface ThanksModalProps {
  submittedKey: string;
  onDone: () => void;
}

export default function ThanksModal({ submittedKey, onDone }: ThanksModalProps) {
  const { lang, t } = useLanguage();
  const stop = (e: MouseEvent) => e.stopPropagation();

  return (
    <div className="modal-overlay" onClick={onDone}>
      <div className="modal-panel modal-panel--center" onClick={stop}>
        <div className="modal-panel__title">{t.thanksTitle}</div>
        <p className="modal-panel__body">
          {t.thanksPending}: {selectionLabel(submittedKey, lang, t)}. {t.thanksBody}
        </p>
        <button type="button" onClick={onDone} className="btn btn--done">
          {t.done}
        </button>
      </div>
    </div>
  );
}
