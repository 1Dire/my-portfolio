import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { GAME_FACTORIES } from "@/data/gameboyGames";

const CANVAS_W = 320;
const CANVAS_H = 288;
const UV_ROTATION = 0; // 게임보이 화면 UV에 맞게 (0, Math.PI/2, -Math.PI/2, Math.PI)

const PAL = {
  bg: "#9bbc0f",
  light: "#8bac0f",
  dark: "#306230",
  darkest: "#0f380f",
};

/**
 * 게임보이 멀티게임 훅.
 * - 메뉴에서 게임 선택 → 플레이 → (B/메뉴버튼) 메뉴 복귀
 * 반환: { texture, api }
 *   api.press()/up()/down()/left()/right(): 입력
 *   api.back(): 게임 중 메뉴로 / 메뉴에서 무시
 */
export function useGameboy() {
  // Canvas 밖(Experience)에서도 호출되므로 useThree 미사용.
  // frameloop="always"라 texture.needsUpdate만으로 매 프레임 반영됨.
  const invalidate = () => {};

  const { canvas, ctx, texture } = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = CANVAS_W;
    canvas.height = CANVAS_H;
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.flipY = false;
    texture.minFilter = THREE.NearestFilter;
    texture.magFilter = THREE.NearestFilter;
    return { canvas, ctx, texture };
  }, []);

  // 게임 인스턴스들 (1회 생성)
  const games = useMemo(() => GAME_FACTORIES.map((g) => ({ name: g.name, game: g.create() })), []);

  const stateRef = useRef({
    mode: "idle",   // "idle" | "menu" | "play"
    sel: 0,         // 메뉴 선택 인덱스
    current: null,  // 현재 게임
    raf: 0,
    lastTime: 0,
  });

  // 그리기
  const draw = () => {
    const st = stateRef.current;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (UV_ROTATION !== 0) {
      ctx.translate(CANVAS_W / 2, CANVAS_H / 2);
      ctx.rotate(UV_ROTATION);
      ctx.translate(-CANVAS_W / 2, -CANVAS_H / 2);
    }

    ctx.fillStyle = PAL.bg;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    if (st.mode === "idle") {
      drawIdle(ctx);
    } else if (st.mode === "menu") {
      drawMenu(ctx, st);
    } else if (st.current) {
      const g = st.current.game;
      g.draw(ctx, CANVAS_W, CANVAS_H, PAL);
      // 점수
      ctx.fillStyle = PAL.dark;
      ctx.font = "14px 'Courier New', monospace";
      ctx.textAlign = "right";
      ctx.textBaseline = "top";
      ctx.fillText(String(g.score).padStart(5, "0"), CANVAS_W - 8, 8);
      // 게임오버
      if (g.over) {
        ctx.fillStyle = PAL.darkest;
        ctx.textAlign = "center";
        ctx.font = "bold 22px 'Courier New', monospace";
        ctx.fillText("GAME OVER", CANVAS_W / 2, 70);
        ctx.font = "12px 'Courier New', monospace";
        ctx.fillText("BEST " + String(g.best).padStart(5, "0"), CANVAS_W / 2, 100);
        ctx.fillText("TAP = RETRY", CANVAS_W / 2, 118);
        ctx.fillText("B = MENU", CANVAS_W / 2, 134);
      } else {
        // 힌트 (상단 좌측 작게)
        ctx.fillStyle = PAL.dark;
        ctx.font = "10px 'Courier New', monospace";
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        ctx.fillText(g.hint, 8, 8);
      }
    }

    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.restore();
    texture.needsUpdate = true;
    invalidate();
  };

  // 루프 제어: active일 때만 매 프레임 갱신
  const FRAME_MS = 1000 / 30; // 30fps 제한 (레트로 느낌 + 부하 1/4)
  const startLoop = () => {
    const st = stateRef.current;
    if (st.raf) return; // 이미 돌고 있음
    st.lastTime = 0;
    st.acc = 0;
    let prev = 0;
    const loop = (time) => {
      if (!prev) prev = time;
      const elapsed = time - prev;
      prev = time;
      st.acc += elapsed;

      if (st.acc >= FRAME_MS) {
        st.acc = st.acc % FRAME_MS;
        const dt = FRAME_MS / 16.67; // 30fps 기준 정규화된 스텝
        if (st.mode === "play" && st.current && !st.current.game.over) {
          st.current.game.update(dt, CANVAS_W, CANVAS_H, PAL);
        }
        draw();
      }
      st.raf = requestAnimationFrame(loop);
    };
    st.raf = requestAnimationFrame(loop);
  };

  const stopLoop = () => {
    const st = stateRef.current;
    if (st.raf) {
      cancelAnimationFrame(st.raf);
      st.raf = 0;
    }
  };

  // api에서 루프 제어 접근용
  const loopCtl = useRef({ startLoop, stopLoop });
  loopCtl.current = { startLoop, stopLoop };

  // 첫 마운트: 메뉴 1회만 그리고 정지 (부하 0)
  useEffect(() => {
    draw();
    return () => {
      stopLoop();
      texture.dispose();
    };
  }, [ctx, texture]); // eslint-disable-line react-hooks/exhaustive-deps

  // 입력 API
  const api = useMemo(() => {
    const st = stateRef.current;
    const startGame = (i) => {
      st.current = games[i];
      st.current.game.reset();
      st.mode = "play";
    };
    return {
      press() {
        if (st.mode === "idle") {
          st.mode = "menu"; // 타이틀 → 메뉴
          st.sel = 0;
        } else if (st.mode === "menu") {
          startGame(st.sel);
        } else if (st.current) {
          const g = st.current.game;
          if (g.over) g.reset();
          else g.input("press");
        }
      },
      up() {
        if (st.mode === "menu") st.sel = (st.sel - 1 + games.length) % games.length;
        else st.current?.game.input("up");
      },
      down() {
        if (st.mode === "menu") st.sel = (st.sel + 1) % games.length;
        else st.current?.game.input("down");
      },
      left() {
        if (st.mode === "play") st.current?.game.input("left");
      },
      right() {
        if (st.mode === "play") st.current?.game.input("right");
      },
      back() {
        // 게임 중 → 메뉴로
        if (st.mode === "play") {
          st.mode = "menu";
          st.current = null;
          return true;
        }
        return false; // 메뉴에서는 처리 안 함 (방 나가기로)
      },
      isMenu() {
        return st.mode === "menu";
      },
      // 게임보이 줌인/줌아웃 시 루프 시작/정지
      setActive(on) {
        if (on) {
          st.mode = "idle"; // 줌인해도 타이틀 화면 유지 (탭하면 메뉴로)
          st.sel = 0;
          loopCtl.current.startLoop();
        } else {
          loopCtl.current.stopLoop();
          st.mode = "idle";
          st.current = null;
          draw();
        }
      },
      // 메뉴에서 클릭 위치(UV)로 항목 선택 + 시작. uv: {x, y} 0~1
      selectAt(uv) {
        if (st.mode !== "menu") {
          // 게임 중 클릭은 그냥 액션
          this.press();
          return;
        }
        const i = itemAt(uv);
        if (i >= 0) { st.sel = i; startGame(i); }
      },
      // 메뉴에서 마우스 호버 위치(UV)로 포커스만 이동
      hoverAt(uv) {
        if (st.mode !== "menu") return;
        const i = itemAt(uv);
        if (i >= 0 && i !== st.sel) {
          st.sel = i;
          if (!st.raf) draw(); // 루프 정지 상태면 직접 다시 그림
        }
      },
    };
  }, [games]);

  // UV → 메뉴 항목 인덱스 (drawMenu 좌표와 일치: startY=80, lineH=30)
  function itemAt(uv) {
    const yPix = uv.y * CANVAS_H;
    const startY = 80, lineH = 30;
    for (let i = 0; i < GAME_FACTORIES.length; i++) {
      const top = startY + i * lineH - 6;
      const bot = top + 26;
      if (yPix >= top && yPix <= bot) return i;
    }
    return -1;
  }

  return { texture, api };
}

// 대기화면 (줌 안 됐을 때) - 멀리서 봐도 매력적인 타이틀
function drawIdle(ctx) {
  const W = CANVAS_W, H = CANVAS_H;

  // 상단 짙은 타이틀 바
  ctx.fillStyle = PAL.darkest;
  ctx.fillRect(0, 36, W, 56);
  ctx.fillStyle = PAL.bg;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "bold 34px 'Courier New', monospace";
  ctx.fillText("GAME BOY", W / 2, 64);

  // 가운데 픽셀 마스코트 (공룡)
  ctx.fillStyle = PAL.darkest;
  drawIdleDino(ctx, W / 2 - 30, 120);

  // 작은 별 장식
  ctx.fillStyle = PAL.dark;
  drawPixStar(ctx, 60, 130, 4);
  drawPixStar(ctx, W - 60, 150, 5);
  drawPixStar(ctx, 80, 200, 3);

  // 하단 안내
  ctx.fillStyle = PAL.darkest;
  ctx.font = "bold 20px 'Courier New', monospace";
  ctx.fillText("TAP TO PLAY", W / 2, H - 56);
  ctx.fillStyle = PAL.dark;
  ctx.font = "12px 'Courier New', monospace";
  ctx.fillText("5 MINI GAMES", W / 2, H - 32);

  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
}

function drawIdleDino(ctx, x, y) {
  const body = [
    "00000001111", "00000001011", "00000001111", "00000001110",
    "10000001111", "10000011110", "11000111100", "11101111000",
    "11111111000", "01111111000", "00111111000", "00011110000",
    "00010010000", "00010010000",
  ];
  const P = 5;
  for (let r = 0; r < body.length; r++)
    for (let c = 0; c < body[r].length; c++)
      if (body[r][c] === "1") ctx.fillRect(x + c * P, y + r * P, P, P);
  // 눈
  const prev = ctx.fillStyle;
  ctx.fillStyle = PAL.bg;
  ctx.fillRect(x + 8 * P, y + 1 * P, P, P);
  ctx.fillStyle = prev;
}

function drawPixStar(ctx, cx, cy, s) {
  ctx.fillRect(cx - s, cy, s * 2, 2);
  ctx.fillRect(cx, cy - s, 2, s * 2);
}

function drawMenu(ctx, st) {
  // 타이틀
  ctx.fillStyle = PAL.darkest;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.font = "bold 22px 'Courier New', monospace";
  ctx.fillText("GAME BOY", CANVAS_W / 2, 22);
  ctx.font = "10px 'Courier New', monospace";
  ctx.fillStyle = PAL.dark;
  ctx.fillText("SELECT A GAME", CANVAS_W / 2, 48);

  // 게임 목록
  ctx.textAlign = "left";
  ctx.font = "16px 'Courier New', monospace";
  const startY = 80;
  const lineH = 30;
  GAME_FACTORIES.forEach((g, i) => {
    const y = startY + i * lineH;
    const selected = i === st.sel;
    if (selected) {
      ctx.fillStyle = PAL.dark;
      ctx.fillRect(40, y - 4, CANVAS_W - 80, 24);
      ctx.fillStyle = PAL.bg;
      ctx.fillText("> " + g.name, 52, y);
    } else {
      ctx.fillStyle = PAL.darkest;
      ctx.fillText("  " + g.name, 52, y);
    }
  });

  // 하단 안내
  ctx.fillStyle = PAL.dark;
  ctx.font = "10px 'Courier New', monospace";
  ctx.textAlign = "center";
  ctx.fillText("UP/DOWN + TAP", CANVAS_W / 2, CANVAS_H - 24);
}