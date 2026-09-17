import { EVENT_CONFIG } from "../config";

export default function Footer() {
  const { donateUrl, streamUrl } = EVENT_CONFIG;

  return (
    <footer className="footer">
      <svg viewBox="0 0 1440 200" preserveAspectRatio="none" className="footer__ridge">
        <polygon
          points="0,200 0,150 180,92 340,140 520,60 660,132 820,86 980,146 1140,96 1300,150 1440,110 1440,200"
          fill="#3b2740"
        />
      </svg>
      <div className="footer__inner">
        <div>
          <div className="footer__brand">Everest 2027</div>
          <div className="footer__tagline">In support of PCHF · Project Beyond Limits</div>
        </div>
        <div className="footer__links">
          <a href={donateUrl} target="_blank" rel="noopener">
            Donate
          </a>
          <a href={streamUrl} target="_blank" rel="noopener">
            Watch live
          </a>
          <a href="https://www.instagram.com/" target="_blank" rel="noopener">
            Instagram
          </a>
          <a href="https://www.facebook.com/" target="_blank" rel="noopener">
            Facebook
          </a>
        </div>
      </div>
    </footer>
  );
}
