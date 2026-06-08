import { useEffect, useMemo } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

const CANVAS_W = 560;
const CANVAS_H = 560;

// UV 회전 보정 (0, Math.PI/2, -Math.PI/2, Math.PI)
const UV_ROTATION = 0;

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

/**
 * 달력 메시에 오늘 날짜를 보여주는 CanvasTexture (손글씨 메모지 스타일).
 * 정적 - 1회만 그림.
 */
export function useCalendarTexture() {
  const { invalidate } = useThree();

  const { ctx, texture } = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = CANVAS_W;
    canvas.height = CANVAS_H;
    const ctx = canvas.getContext("2d");
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.flipY = false;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    return { ctx, texture };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const draw = () => {
      if (cancelled) return;
      drawCalendar(ctx);
      texture.needsUpdate = true;
      invalidate();
    };

    // 손글씨 폰트 로드 후 그리기 (이미 로드돼 있으면 바로)
    if (document.fonts && document.fonts.load) {
      document.fonts.load("40px 'Patrick Hand'").then(draw).catch(draw);
    }
    draw(); // 폰트 없어도 일단 1회

    return () => {
      cancelled = true;
      texture.dispose();
    };
  }, [ctx, texture, invalidate]);

  return texture;
}

function drawCalendar(ctx) {
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  if (UV_ROTATION !== 0) {
    ctx.translate(CANVAS_W / 2, CANVAS_H / 2);
    ctx.rotate(UV_ROTATION);
    ctx.translate(-CANVAS_W / 2, -CANVAS_H / 2);
  }
  drawContent(ctx);
  ctx.restore();
}

function drawContent(ctx) {
  const W = CANVAS_W;
  const H = CANVAS_H;

  const now = new Date();
  const month = MONTHS[now.getMonth()];
  const monthNum = now.getMonth() + 1;
  const date = now.getDate();
  const day = DAYS[now.getDay()];
  const year = now.getFullYear();

  const FONT = "'Patrick Hand', 'Comic Sans MS', cursive";

  // 종이 배경 (크림색)
  ctx.fillStyle = "#fdfaf0";
  ctx.fillRect(0, 0, W, H);

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // 연도 + 월 (상단) - "2026 . June"
  ctx.fillStyle = "#c08552";
  ctx.font = `46px ${FONT}`;
  ctx.fillText(`${year} . ${month}`, W / 2, H * 0.22);

  // 구분선 (손그림 물결)
  ctx.strokeStyle = "#e0c9a8";
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.beginPath();
  const lineY = H * 0.31;
  const lineW = W * 0.5;
  ctx.moveTo(W / 2 - lineW / 2, lineY);
  for (let i = 0; i <= 1; i += 0.1) {
    const x = W / 2 - lineW / 2 + lineW * i;
    ctx.lineTo(x, lineY + Math.sin(i * Math.PI * 3) * 2);
  }
  ctx.stroke();

  // 큰 날짜 숫자 (중앙)
  ctx.fillStyle = "#4a3b2e";
  ctx.font = `230px ${FONT}`;
  ctx.fillText(String(date), W / 2, H * 0.56);

  // 요일 (날짜 아래)
  ctx.fillStyle = "#a07850";
  ctx.font = `44px ${FONT}`;
  ctx.fillText(day, W / 2, H * 0.77);

  // 작은 별 장식 (요일 양옆)
  ctx.fillStyle = "#d8b88a";
  const dayW = ctx.measureText(day).width;
  drawStar(ctx, W / 2 - dayW / 2 - 28, H * 0.77, 7);
  drawStar(ctx, W / 2 + dayW / 2 + 28, H * 0.77, 7);
 
  // 전체 날짜 (하단) - "2026. 06. 06"
  ctx.fillStyle = "#c4b8a8";
  ctx.font = `30px ${FONT}`;
  const pad = (n) => String(n).padStart(2, "0");
  ctx.fillText(`${year}. ${pad(monthNum)}. ${pad(date)}`, W / 2, H * 0.91);

  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
}

// 작은 4꼭지 별 (반짝이 장식)
function drawStar(ctx, cx, cy, r) {
  ctx.beginPath();
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 - Math.PI / 2;
    const a2 = a + Math.PI / 4;
    ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
    ctx.lineTo(cx + Math.cos(a2) * r * 0.35, cy + Math.sin(a2) * r * 0.35);
  }
  ctx.closePath();
  ctx.fill();
}