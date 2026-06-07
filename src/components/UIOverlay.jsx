import { FiSun, FiMoon, FiVolume2, FiVolumeX, FiGithub, FiInfo, FiX } from "react-icons/fi";
import { FaXTwitter } from "react-icons/fa6";

const GITHUB_URL = "https://github.com/1Dire";
const REPO_URL = "https://github.com/1Dire/my-portfolio";
const X_URL = "https://x.com/1Dire_dev";
const MUSIC_URL = "https://pixabay.com/music/beats-lofi-chill-background-music-508269/";
const GAME_MUSIC_URL = "https://pixabay.com/music/video-games-the-console-of-my-dreams-301289/";

// 야간 모드 화면 틴트
export function NightOverlay({ active }) {
  return <div className={`night-overlay${active ? " is-night" : ""}`} />;
}

// 우측 상단: 주간/야간 토글 + 음소거
export function RoomControls({ dayNight, onToggleDayNight, bgm }) {
  return (
    <div className="ui-cluster ui-cluster--top-right">
      <button
        className="ui-btn"
        onClick={onToggleDayNight}
        aria-label={dayNight === "day" ? "야간 모드로" : "주간 모드로"}
      >
        {dayNight === "day" ? <FiSun size={20} /> : <FiMoon size={19} />}
      </button>

      {bgm.started && (
        <button
          className="ui-btn"
          onClick={bgm.toggleMute}
          aria-label={bgm.muted ? "음악 켜기" : "음악 끄기"}
        >
          {bgm.muted ? <FiVolumeX size={20} /> : <FiVolume2 size={20} />}
        </button>
      )}
    </div>
  );
}

// 우측 하단: GitHub + 크레딧
export function BottomLinks({ onOpenCredits }) {
  return (
    <div className="ui-cluster ui-cluster--bottom-right">
      <a
        className="ui-btn"
        href={X_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="X (트위터)"
      >
        <FaXTwitter size={19} />
      </a>
      <a
        className="ui-btn"
        href={GITHUB_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="GitHub 프로필"
      >
        <FiGithub size={20} />
      </a>
      <button className="ui-btn" onClick={onOpenCredits} aria-label="크레딧">
        <FiInfo size={20} />
      </button>
    </div>
  );
}

// 크레딧 모달
export function CreditsModal({ open, onClose }) {
  if (!open) return null;
  return (
    <div className="credits" onClick={onClose}>
      <div className="credits__note" onClick={(e) => e.stopPropagation()}>
        <span className="credits__pin" aria-hidden="true" />
        <button className="credits__close" onClick={onClose} aria-label="닫기">
          <FiX size={20} />
        </button>

        <h2 className="credits__title">dire's room</h2>
        <p className="credits__subtitle">made by sang-woo lee</p>

        <div className="credits__list">
          <p className="credits__label">credits</p>
          <p>✏ 3D modeling &amp; design — sang-woo lee</p>
          <p>{"</>"} development — sang-woo lee</p>
          <p>
            ♪ room music —{" "}
            <a className="credits__link" href={MUSIC_URL} target="_blank" rel="noopener noreferrer">
              Lofi Chill (Pixabay)
            </a>
          </p>
          <p>
            ♪ game music —{" "}
            <a className="credits__link" href={GAME_MUSIC_URL} target="_blank" rel="noopener noreferrer">
              The Console of My Dreams (Pixabay)
            </a>
          </p>
          <p>⚙ built with React Three Fiber</p>
          <p>
            {"</>"} source —{" "}
            <a className="credits__link" href={REPO_URL} target="_blank" rel="noopener noreferrer">
              github repo
            </a>
          </p>
        </div>

        <div className="credits__socials">
          <a className="credits__github" href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
            <FiGithub size={17} /> github.com/1Dire
          </a>
          <a className="credits__github" href={X_URL} target="_blank" rel="noopener noreferrer">
            <FaXTwitter size={15} /> @1Dire_dev
          </a>
        </div>
      </div>
    </div>
  );
}