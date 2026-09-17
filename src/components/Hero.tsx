import { useParallax } from "../hooks/useParallax";
import { useSnowCanvas } from "../hooks/useSnowCanvas";
import { useCountdown } from "../hooks/useCountdown";
import SkierScene from "./SkierScene";
import pchfLogo from "../assets/pchf-logo.png";
import { EVENT_CONFIG } from "../config";

interface HeroProps {
  onSkiClick: () => void;
}

export default function Hero({ onSkiClick }: HeroProps) {
  const { back, mid, fore } = useParallax();
  const snowCanvasRef = useSnowCanvas();
  const countdown = useCountdown();
  const { isLive, liveNote, streamUrl, donateUrl } = EVENT_CONFIG;

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
          <div className="hero__cause">For Perth Children's Hospital Foundation</div>
        </div>
        <div className="hero__project">Project Beyond Limits</div>
      </header>

      {isLive && (
        <div className="hero__live-row">
          <div className="hero__live-badge">
            <span className="hero__live-dot" />
            <span className="hero__live-text">Live now</span>
            <span className="hero__live-note">{liveNote}</span>
          </div>
        </div>
      )}

      <div className="hero__content">
        <div className="hero__column">
          <h1 className="hero__title">
            100km
            <br />
            SkiErg Relay
          </h1>
          <p className="hero__intro">
            Every dollar donated helps WA&rsquo;s sick kids at Perth Children&rsquo;s Hospital —
            and pushes us further than 100km.
          </p>

          <SkierScene />

          <div className="countdown">
            <div className="countdown__label">Starts in</div>
            <div className="countdown__digits">
              <span>{countdown.days}</span>
              <span className="countdown__colon">:</span>
              <span>{countdown.hours}</span>
              <span className="countdown__colon">:</span>
              <span>{countdown.mins}</span>
            </div>
            <div className="countdown__units">dd : hh : mm</div>
          </div>

          <div className="cta-stack">
            <a
              href={donateUrl}
              target="_blank"
              rel="noopener"
              className="btn btn--primary"
            >
              Donate Now
            </a>
            <div className="cta-row">
              <a
                href={streamUrl}
                target="_blank"
                rel="noopener"
                className={`btn btn--secondary${isLive ? " btn--pulse" : ""}`}
              >
                Watch Live
              </a>
              <button onClick={onSkiClick} className="btn btn--secondary">
                I want to Ski!
              </button>
            </div>
          </div>

          <div className="stat-row">
            <span>3–4 Oct</span>
            <span>29 hour cap</span>
            <span className="stat-row__chip">100% to PCHF</span>
          </div>

          <div className="pchf-lockup">
            <div className="eyebrow eyebrow--muted">In support of</div>
            <img src={pchfLogo} alt="Perth Children's Hospital Foundation" className="pchf-lockup__logo" />
          </div>
        </div>
      </div>
    </section>
  );
}
