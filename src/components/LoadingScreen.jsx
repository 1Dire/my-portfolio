import { useProgress } from "@react-three/drei";
import { useState, useEffect } from "react";

const LOADING_MESSAGES = [
  "cleaning the room",
  "tidying the desk",
  "booting the laptop",
  "brewing some coffee",
  "turning on the lamp",
  "charging the game boy",
  "hanging up posters",
  "rolling the dice",
  "compiling shaders",
  "dusting the shelves",
];

export function LoadingScreen({ onEnter }) {
  const { progress, active } = useProgress();
  const [done, setDone] = useState(false);
  const [showEnter, setShowEnter] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(false);
  const [msgIndex, setMsgIndex] = useState(0);

  // 로딩 완료 감지
  useEffect(() => {
    if (!active && progress >= 100) {
      const t = setTimeout(() => setDone(true), 600);
      return () => clearTimeout(t);
    }
  }, [active, progress]);

  // 안전장치: progress 이벤트가 안 와도 일정 시간 후 완료
  useEffect(() => {
    const fallback = setTimeout(() => setDone(true), 8000);
    return () => clearTimeout(fallback);
  }, []);

  // done되면 문구 페이드아웃(0.4s) 후 Enter 버튼 등장
  useEffect(() => {
    if (!done) return;
    const t = setTimeout(() => setShowEnter(true), 450);
    return () => clearTimeout(t);
  }, [done]);

  // 로딩 중 문구 순환
  useEffect(() => {
    if (done) return;
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 1400);
    return () => clearInterval(interval);
  }, [done]);

  const handleEnter = (withMusic) => {
    setLeaving(true);
    onEnter?.(withMusic);
    setTimeout(() => setGone(true), 700);
  };

  if (gone) return null;

  // 표시용 진행률 (완료 시 100 고정)
  const shownProgress = done ? 100 : Math.round(progress);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(58, 68, 52, 1)",
        opacity: leaving ? 0 : 1,
        transition: "opacity 0.7s ease",
        pointerEvents: leaving ? "none" : "auto",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Patrick+Hand&display=swap');
        @keyframes ls-rise {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes ls-msg {
          0%   { opacity: 0; transform: translateY(6px); filter: blur(2px); }
          100% { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
        @keyframes ls-msg-out {
          0%   { opacity: 1; transform: translateY(0); filter: blur(0); }
          100% { opacity: 0; transform: translateY(-6px); filter: blur(2px); }
        }
        @keyframes ls-pulse {
          0%, 100% { opacity: 0.85; }
          50% { opacity: 1; }
        }
        .ls-msg { display: inline-block; animation: ls-msg 0.5s cubic-bezier(0.22,1,0.36,1); }
        .ls-msg-out { display: inline-block; animation: ls-msg-out 0.4s ease forwards; }
        .ls-enter { animation: ls-rise 0.6s ease both, ls-pulse 2s ease-in-out infinite 0.6s; transition: background 0.2s; }
        .ls-enter:hover { background: rgba(210,185,120,0.28) !important; }
      `}</style>

      {/* 라벨 */}
      <p
        style={{
          fontFamily: "'Patrick Hand', cursive",
          color: "rgba(210, 190, 130, 0.5)",
          fontSize: 17,
          margin: "0 0 6px",
          letterSpacing: 3,
        }}
      >
        — portfolio
      </p>

      {/* 타이틀 */}
      <h1
        style={{
          fontFamily: "'Patrick Hand', cursive",
          color: "rgba(248, 238, 205, 0.95)",
          fontSize: 40,
          margin: "0 0 28px",
          letterSpacing: 0.5,
        }}
      >
        dire's room
      </h1>

      {/* 진행 바 */}
      <div
        style={{
          width: 280,
          height: 6,
          background: "rgba(0,0,0,0.22)",
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${shownProgress}%`,
            height: "100%",
            background: "rgba(210, 185, 120, 0.9)",
            borderRadius: 3,
            transition: "width 0.4s ease",
          }}
        />
      </div>

      {/* 하단 영역: 문구(로딩) → 페이드아웃(완료) → Enter 버튼 */}
      <div
        style={{
          marginTop: 24,
          minHeight: 52,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {showEnter ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              alignItems: "center",
            }}
          >
            <button
              className="ls-enter"
              onClick={() => handleEnter(true)}
              style={{
                fontFamily: "'Patrick Hand', cursive",
                fontSize: 22,
                color: "rgba(245, 230, 185, 0.95)",
                background: "transparent",
                border: "1px solid rgba(200, 175, 110, 0.4)",
                borderRadius: 8,
                padding: "9px 38px",
                cursor: "pointer",
                letterSpacing: 1,
              }}
            >
              Come on in
            </button>
            <button
              onClick={() => handleEnter(false)}
              style={{
                fontFamily: "'Patrick Hand', cursive",
                fontSize: 15,
                color: "rgba(210, 190, 130, 0.6)",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                letterSpacing: 0.5,
                textDecoration: "underline",
                textUnderlineOffset: 4,
              }}
            >
              enter quietly
            </button>
          </div>
        ) : (
          <span
            key={done ? "out" : msgIndex}
            className={done ? "ls-msg-out" : "ls-msg"}
            style={{
              fontFamily: "'Patrick Hand', cursive",
              color: "rgba(210, 190, 130, 0.6)",
              fontSize: 18,
            }}
          >
            {done ? "all set" : LOADING_MESSAGES[msgIndex]}...
          </span>
        )}
      </div>
    </div>
  );
}
