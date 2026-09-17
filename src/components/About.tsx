import { useLanguage } from "../i18n/LanguageContext";

export default function About() {
  const { t } = useLanguage();

  return (
    <section className="about">
      <div className="about__inner">
        <h2 className="h2">{t.aboutHeading}</h2>
        <p className="about__p">{t.aboutP1}</p>
        <p className="about__p">{t.aboutP2}</p>
        <p className="about__p about__p--last">{t.aboutP3}</p>
      </div>
    </section>
  );
}
