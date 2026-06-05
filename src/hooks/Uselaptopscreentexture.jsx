import { useEffect, useMemo, useRef } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { projects } from "@/data/projects";

const CANVAS_W = 480;
const CANVAS_H = 768;

// 미리보기에 보여줄 toy 프로젝트 (이미지 있는 것, 최대 4개)
const PREVIEW = projects
  .filter((p) => p.category === "toy" && p.image && !p.image.includes("placehold"))
  .slice(0, 4);

const CARD_BG = ["#fffef5", "#fff9f0", "#f5fff5", "#f5f8ff"];
const TAPE = [
  "rgba(255, 220, 120, 0.75)",
  "rgba(180, 220, 255, 0.75)",
  "rgba(200, 240, 180, 0.75)",
  "rgba(255, 190, 190, 0.75)",
];
const CARD_ROT = [-2.5, 1.8, -1.5, 2.2];

/**
 * 노트북 화면: 갤러리 축소 미리보기 (정적 - 1회만 그림, 매 프레임 부하 0).
 */
export function useLaptopScreenTexture() {
  const { invalidate } = useThree();

  const { canvas, ctx, texture } = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = CANVAS_W;
    canvas.height = CANVAS_H;
    const ctx = canvas.getContext("2d");
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.flipY = false;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    return { canvas, ctx, texture };
  }, []);

  useEffect(() => {
    // 카드 이미지 로드 → 각 이미지가 로드될 때마다 한 번씩 다시 그림
    const imgs = PREVIEW.map((p) => {
      const img = new Image();
      img.src = p.image;
      img.onload = () => {
        drawGallery(ctx, imgs);
        texture.needsUpdate = true;
        invalidate();
      };
      return img;
    });

    // 초기 1회 (이미지 없이 배경/카드틀 먼저)
    drawGallery(ctx, imgs);
    texture.needsUpdate = true;
    invalidate();

    return () => texture.dispose();
  }, [ctx, texture, invalidate]);

  return texture;
}

function drawGallery(ctx, imgs) {
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.translate(CANVAS_W / 2, CANVAS_H / 2);
  ctx.rotate(-Math.PI / 2);
  // 회전 후 좌표계: 가로=CANVAS_H, 세로=CANVAS_W
  ctx.translate(-CANVAS_H / 2, -CANVAS_W / 2);
  drawContent(ctx, imgs);
  ctx.restore();
}

// 회전 좌표계 기준 (W=CANVAS_H=768, H=CANVAS_W=480)
function drawContent(ctx, imgs) {
  const W = CANVAS_H; // 768
  const H = CANVAS_W; // 480

  // 갤러리 배경 (올리브 그린)
  ctx.fillStyle = "#3a4434";
  ctx.fillRect(0, 0, W, H);

  // ===== 헤더 =====
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "rgba(210, 190, 130, 0.55)";
  ctx.font = "16px 'Patrick Hand', 'Courier New', cursive";
  ctx.fillText("— portfolio", 36, 40);
  ctx.fillStyle = "rgba(248, 238, 205, 0.95)";
  ctx.font = "bold 34px 'Patrick Hand', 'Courier New', cursive";
  ctx.fillText("Project Notes", 36, 74);

  ctx.strokeStyle = "rgba(200, 175, 110, 0.2)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(36, 90);
  ctx.lineTo(W - 36, 90);
  ctx.stroke();

  // ===== 카드 한 줄에 4개 =====
  if (PREVIEW.length > 0) {
    const cardW = 160, gap = 16;
    const n = PREVIEW.length;
    const totalW = n * cardW + (n - 1) * gap;
    const startX = (W - totalW) / 2;
    const startY = 130;
    PREVIEW.forEach((proj, i) => {
      const x = startX + i * (cardW + gap);
      drawCard(ctx, proj, imgs[i], x, startY, i);
    });
  }

  // ===== 하단 클릭 유도 (정적) =====
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "rgba(248, 238, 205, 0.92)";
  ctx.font = "bold 26px 'Patrick Hand', 'Courier New', cursive";
  ctx.fillText("click to open", W / 2, H - 32);
  ctx.textAlign = "left";
}

function drawCard(ctx, proj, img, x, y, i) {
  const cardW = 160, cardH = 185;
  const rot = (CARD_ROT[i % CARD_ROT.length] * Math.PI) / 180;

  ctx.save();
  ctx.translate(x + cardW / 2, y + cardH / 2);
  ctx.rotate(rot);
  ctx.translate(-cardW / 2, -cardH / 2);

  // 그림자
  ctx.shadowColor = "rgba(0,0,0,0.35)";
  ctx.shadowBlur = 10;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 5;
  ctx.fillStyle = CARD_BG[i % CARD_BG.length];
  ctx.fillRect(0, 0, cardW, cardH);
  ctx.shadowColor = "transparent";

  // 썸네일
  const imgH = 105;
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, cardW, imgH);
  ctx.clip();
  if (img && img.complete && img.naturalWidth > 0) {
    const ir = img.naturalWidth / img.naturalHeight;
    const cr = cardW / imgH;
    let dw, dh, dx, dy;
    if (ir > cr) { dh = imgH; dw = imgH * ir; dx = (cardW - dw) / 2; dy = 0; }
    else { dw = cardW; dh = cardW / ir; dx = 0; dy = (imgH - dh) / 2; }
    ctx.drawImage(img, dx, dy, dw, dh);
  } else {
    ctx.fillStyle = "#ddd";
    ctx.fillRect(0, 0, cardW, imgH);
  }
  ctx.restore();

  // 제목
  ctx.fillStyle = "rgba(40, 26, 6, 0.88)";
  ctx.font = "bold 17px 'Patrick Hand', 'Courier New', cursive";
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  let title = proj.title;
  while (ctx.measureText(title).width > cardW - 20 && title.length > 3) {
    title = title.slice(0, -1);
  }
  if (title !== proj.title) title = title.slice(0, -1) + "…";
  ctx.fillText(title, 12, imgH + 28);

  // 줄선
  ctx.strokeStyle = "rgba(100, 140, 200, 0.15)";
  ctx.lineWidth = 1;
  [imgH + 44, imgH + 60].forEach((ly) => {
    ctx.beginPath();
    ctx.moveTo(10, ly);
    ctx.lineTo(cardW - 10, ly);
    ctx.stroke();
  });

  // 테이프
  ctx.fillStyle = TAPE[i % TAPE.length];
  ctx.save();
  ctx.translate(cardW / 2, 0);
  ctx.rotate(-rot * 0.5);
  ctx.fillRect(-28, -8, 56, 18);
  ctx.restore();

  ctx.restore();
}