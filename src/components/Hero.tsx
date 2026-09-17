import { useParallax } from "../hooks/useParallax";
import { useSnowCanvas } from "../hooks/useSnowCanvas";
import { useCountdown } from "../hooks/useCountdown";
import SkierScene from "./SkierScene";
import LanguageSwitch from "./LanguageSwitch";
import pchfLogo from "../assets/pchf-logo.png";
import { EVENT_CONFIG } from "../config";
import { useLanguage } from "../i18n/LanguageContext";

interface HeroProps {
  onSkiClick: () => void;
}

export default function Hero({ onSkiClick }: HeroProps) {
  const { back, mid, fore } = useParallax();
  const snowCanvasRef = useSnowCanvas();
  const countdown = useCountdown();
  const { isLive, liveNote, streamUrl, donateUrl } = EVENT_CONFIG;
  const { t } = useLanguage();

  return (
    <section className="hero">
      <div className="hero__sun" />

      <svg
        ref={back}
        viewBox="0 0 1440 420"
        preserveAspectRatio="none"
        className="hero__ridge hero__ridge--back"
      >
        <polygon
          points="0,420 0,250 150,150 290,226 430,96 560,210 700,130 820,240 960,146 1120,238 1260,168 1440,262 1440,420"
          fill="#5a3a55"
        />
      </svg>
      <svg
        ref={mid}
        viewBox="0 0 1440 420"
        preserveAspectRatio="none"
        className="hero__ridge hero__ridge--mid"
      >
        <polygon
          points="0,420 0,300 210,196 360,268 520,120 660,244 790,186 940,286 1100,190 1240,272 1440,214 1440,420"
          fill="#40283f"
        />
      </svg>
      <svg
        ref={fore}
        viewBox="0 0 1440 420"
        preserveAspectRatio="none"
        className="hero__ridge hero__ridge--fore"
      >
        <polygon
          points="0,420 0,330 180,268 300,300 430,236 540,282 700,206 760,240 880,214 1010,286 1160,240 1300,300 1440,258 1440,420"
          fill="#2a1a2c"
        />
      </svg>

      <canvas ref={snowCanvasRef} className="hero__snow" />
      <div className="hero__scrim" />

      <header className="hero__header">
        <div>
          <div className="eyebrow eyebrow--cream">Everest 2027</div>
          <div className="hero__cause">{t.causeLine}</div>
        </div>
        <div className="hero__header-right">
          <div className="hero__project">Project Beyond Limits</div>
          <LanguageSwitch />
        </div>
      </header>

      {isLive && (
        <div className="hero__live-row">
          <div className="hero__live-badge">
            <span className="hero__live-dot" />
            <span className="hero__live-text">{t.liveNow}</span>
            <span className="hero__live-note">{liveNote}</span>
          </div>
        </div>
      )}

      <div className="hero__content">
        <div className="hero__column">
          <h1 className="hero__title">
            {t.heroTitleLine1}
            <br />
            {t.heroTitleLine2}
          </h1>
          <p className="hero__intro">{t.heroIntro}</p>

          <SkierScene />

          <div className="countdown">
            <div className="countdown__label">{t.startsIn}</div>
            <div className="countdown__digits">
              <span>{countdown.days}</span>
              <span className="countdown__colon">:</span>
              <span>{countdown.hours}</span>
              <span className="countdown__colon">:</span>
              <span>{countdown.mins}</span>
            </div>
            <div className="countdown__units">{t.countdownUnits}</div>
          </div>

          <div className="cta-stack">
            <a
              href={donateUrl}
              target="_blank"
              rel="noopener"
              className="btn btn--primary"
            >
              {t.donateNow}
            </a>
            <div className="cta-row">
              <a
                href={streamUrl}
                target="_blank"
                rel="noopener"
                className={`btn btn--secondary${isLive ? " btn--pulse" : ""}`}
              >
                {t.watchLive}
              </a>
              <button onClick={onSkiClick} className="btn btn--secondary">
                {t.iWantToSki}
              </button>
            </div>
          </div>

          <div className="stat-row">
            <span>{t.statDate}</span>
            <span>{t.statHourCap}</span>
            <span className="stat-row__chip">{t.statChip}</span>
          </div>

          <div className="pchf-lockup">
            <div className="eyebrow eyebrow--muted">{t.inSupportOf}</div>
            <img src={pchfLogo} alt="Perth Children's Hospital Foundation" className="pchf-lockup__logo" />
          </div>
        </div>
      </div>
    </section>
  );
}
