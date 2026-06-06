import { useEffect, useState, useCallback } from "react";

/**
 * 게임보이 조작 키패드 오버레이.
 * - 게임 플레이 중(visible) 화면 하단에 표시
 * - 키보드 입력 처리 + 시각 피드백(키캡 반짝)
 * - 버튼 클릭/터치로도 입력 (모바일 대응)
 *
 * props:
 *   visible: boolean
 *   api: useGameboy의 api (press/up/down/left/right/back)
 *   onExit: ESC/나가기 콜백
 */
export function GameboyPad({ visible, api, onExit }) {
  const [active, setActive] = useState({}); // 어떤 키가 눌렸는지 (반짝용)

  const flash = useCallback((key) => {
    setActive((p) => ({ ...p, [key]: true }));
    setTimeout(() => setActive((p) => ({ ...p, [key]: false })), 140);
  }, []);

  // 입력 실행 + 피드백
  const fire = useCallback(
    (key) => {
      if (!api) return;
      switch (key) {
        case "up": api.up(); break;
        case "down": api.down(); break;
        case "left": api.left(); break;
        case "right": api.right(); break;
        case "a": api.press(); break;
        case "b": api.back(); break;
        default: break;
      }
      flash(key);
    },
    [api, flash]
  );

  // 키보드 입력
  useEffect(() => {
    if (!visible) return;
    const onKey = (e) => {
      switch (e.code) {
        case "ArrowUp": e.preventDefault(); fire("up"); break;
        case "ArrowDown": e.preventDefault(); fire("down"); break;
        case "ArrowLeft": e.preventDefault(); fire("left"); break;
        case "ArrowRight": e.preventDefault(); fire("right"); break;
        case "Space": case "Enter": e.preventDefault(); fire("a"); break;
        case "KeyB": fire("b"); break;
        default: break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [visible, fire]);

  if (!visible) return null;

  return (
    <div style={styles.wrap}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Patrick+Hand&display=swap');
        .gb-key {
          font-family: 'Patrick Hand', cursive;
          background: rgba(40, 48, 36, 0.85);
          color: rgba(210, 230, 160, 0.9);
          border: 2px solid rgba(120, 150, 90, 0.5);
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          user-select: none; -webkit-user-select: none;
          cursor: pointer;
          transition: transform 0.1s, background 0.1s, box-shadow 0.1s;
          touch-action: manipulation;
        }
        .gb-key:active, .gb-key.on {
          transform: scale(0.9);
          background: rgba(155, 188, 15, 0.9);
          color: #0f380f;
          box-shadow: 0 0 12px rgba(155, 188, 15, 0.6);
        }
      `}</style>

      {/* 방향키 (좌측) */}
      <div style={{ pointerEvents: "auto" }}>
        <div style={styles.dpad}>
          <div />
          <Key id="up" label="↑" active={active.up} fire={fire} big />
          <div />
          <Key id="left" label="←" active={active.left} fire={fire} big />
          <Key id="down" label="↓" active={active.down} fire={fire} big />
          <Key id="right" label="→" active={active.right} fire={fire} big />
        </div>
      </div>

      {/* A / B 버튼 (우측) */}
      <div style={styles.ab}>
        <Key id="b" label="B" sub="MENU" keyName="B" active={active.b} fire={fire} round />
        <Key id="a" label="A" sub="JUMP/OK" keyName="SPACE" active={active.a} fire={fire} round />
      </div>

      {/* 상단 우측: 나가기 */}
      <div style={styles.topBtns}>
        <button className="gb-key" style={styles.topBtn} onClick={onExit}>
          ✕ 나가기
        </button>
      </div>
    </div>
  );
}

function Key({ id, label, sub, keyName, active, fire, big, round }) {
  const size = big ? 46 : 56;
  const btn = (
    <div
      className={`gb-key ${active ? "on" : ""}`}
      style={{
        width: size, height: size,
        borderRadius: round ? "50%" : 8,
        flexDirection: "column",
        fontSize: big ? 22 : 20,
        lineHeight: 1,
      }}
      onPointerDown={(e) => { e.preventDefault(); fire(id); }}
    >
      <span>{label}</span>
      {sub && <span style={{ fontSize: 9, opacity: 0.7, marginTop: 2 }}>{sub}</span>}
    </div>
  );

  // keyName 있으면 버튼 아래 작은 키캡 라벨
  if (keyName) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
        {btn}
        <span style={{
          fontFamily: "'Patrick Hand', cursive",
          fontSize: 11,
          color: "rgba(210, 230, 160, 0.65)",
          background: "rgba(40, 48, 36, 0.7)",
          border: "1px solid rgba(120, 150, 90, 0.4)",
          borderRadius: 4,
          padding: "1px 6px",
          whiteSpace: "nowrap",
        }}>{keyName}</span>
      </div>
    );
  }
  return btn;
}

const styles = {
  wrap: {
    position: "fixed",
    bottom: 0, left: 0, right: 0,
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
    padding: "0 28px 28px",
    zIndex: 90,
    pointerEvents: "none", // 자식 버튼만 클릭 받게
  },
  dpad: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 46px)",
    gridTemplateRows: "repeat(2, 46px)",
    gap: 4,
    pointerEvents: "auto",
  },
  ab: {
    display: "flex",
    gap: 16,
    alignItems: "center",
    pointerEvents: "auto",
  },
  topBtns: {
    position: "absolute",
    top: -56, right: 28,
    display: "flex",
    gap: 10,
    pointerEvents: "auto",
  },
  topBtn: {
    padding: "8px 16px",
    fontSize: 16,
    height: "auto",
  },
};