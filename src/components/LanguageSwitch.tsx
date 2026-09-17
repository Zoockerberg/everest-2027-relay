import { useLanguage } from "../i18n/LanguageContext";
import { FLAGS, type Lang } from "../i18n/translations";

const OPTIONS: Lang[] = ["en", "fr"];

export default function LanguageSwitch() {
  const { lang, setLang } = useLanguage();

  return (
    <div className="lang-switch" role="group" aria-label="Language">
      {OPTIONS.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => setLang(option)}
          className={`lang-switch__btn${lang === option ? " lang-switch__btn--active" : ""}`}
          aria-pressed={lang === option}
          aria-label={option === "en" ? "English" : "Français"}
        >
          {FLAGS[option]}
        </button>
      ))}
    </div>
  );
}
