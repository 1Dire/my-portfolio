// 게임보이 미니게임 모음. 각 게임 인터페이스:
//   { title, hint, over, score, best, reset(), update(dt,W,H,PAL), draw(ctx,W,H,PAL), input(type) }

// ===================== 공룡 (Dino) =====================
export function createDino() {
  let s = {};
  const reset = () => {
    s = {
      dinoY: 0, vel: 0, jumping: false,
      obstacles: [], clouds: [{ x: 200, y: 40 }, { x: 320, y: 70 }],
      speed: 1.6, spawnTimer: 0,
      score: 0, best: s.best || 0, legFrame: 0, over: false,
    };
  };
  reset();

  return {
    title: "DINO RUN",
    hint: "TAP=JUMP",
    get over() { return s.over; },
    get score() { return Math.floor(s.score); },
    get best() { return Math.floor(s.best); },
    reset,
    input(type) {
      if (s.over) return;
      if (type === "press" || type === "up") {
        if (!s.jumping) { s.jumping = true; s.vel = 9.5; }
      }
    },
    update(dt, W, H) {
      if (s.over) return;
      const groundY = H - 46;
      s.score += s.speed * dt * 0.3;
      s.speed = 1.6 + s.score * 0.0008;
      s.legFrame = Math.floor(s.score / 4) % 2;

      if (s.jumping) {
        s.dinoY += s.vel * dt;
        s.vel -= 0.62 * dt;
        if (s.dinoY <= 0) { s.dinoY = 0; s.jumping = false; s.vel = 0; }
      }

      for (const c of s.clouds) {
        c.x -= s.speed * dt * 0.3;
        if (c.x < -30) { c.x = W + 20; c.y = 30 + Math.random() * 50; }
      }

      for (const o of s.obstacles) o.x -= s.speed * dt;
      s.obstacles = s.obstacles.filter((o) => o.x + o.w > -10);

      s.spawnTimer -= dt;
      if (s.spawnTimer <= 0) {
        const h = 14 + Math.random() * 10;
        s.obstacles.push({ x: W + 10, w: 8 + Math.random() * 6, h });
        s.spawnTimer = 110 + Math.random() * 80 - s.score * 0.03;
        if (s.spawnTimer < 65) s.spawnTimer = 65;
      }

      const dx = 30, dw = 22, dh = 26;
      const dy = groundY - dh - s.dinoY;
      for (const o of s.obstacles) {
        if (dx + dw - 6 > o.x && dx + 5 < o.x + o.w && dy + dh > groundY - o.h) {
          s.over = true;
          if (s.score > s.best) s.best = s.score;
        }
      }
    },
    draw(ctx, W, H, PAL) {
      const groundY = H - 46;
      ctx.fillStyle = PAL.light;
      for (const c of s.clouds) {
        ctx.fillRect(c.x, c.y, 18, 5);
        ctx.fillRect(c.x + 4, c.y - 4, 10, 4);
      }
      ctx.fillStyle = PAL.darkest;
      ctx.fillRect(0, groundY, W, 2);
      ctx.fillStyle = PAL.dark;
      for (let x = (-s.score * 2) % 22; x < W; x += 22) {
        ctx.fillRect(x, groundY + 6, 5, 1);
        ctx.fillRect(x + 11, groundY + 10, 3, 1);
      }
      ctx.fillStyle = PAL.darkest;
      const dx = 30, dy = groundY - 26 - s.dinoY;
      drawDino(ctx, dx, dy, s.jumping ? 2 : s.legFrame, PAL);
      ctx.fillStyle = PAL.darkest;
      for (const o of s.obstacles) {
        ctx.fillRect(o.x, groundY - o.h, o.w, o.h);
        ctx.fillRect(o.x - 2, groundY - o.h + 5, 2, 6);
        ctx.fillRect(o.x + o.w, groundY - o.h + 8, 2, 6);
      }
    },
  };
}

const DINO_BODY = [
  "00000001111", "00000001011", "00000001111", "00000001110",
  "10000001111", "10000011110", "11000111100", "11101111000",
  "11111111000", "01111111000", "00111111000", "00011110000",
];
const DINO_LEGS = {
  0: ["00010010000", "00010000000"],
  1: ["00010010000", "00000010000"],
  2: ["00010010000", "00010010000"],
};
function drawDino(ctx, x, y, legFrame, PAL) {
  const P = 2.1;
  const stamp = (rows, oy) => {
    for (let r = 0; r < rows.length; r++)
      for (let c = 0; c < rows[r].length; c++)
        if (rows[r][c] === "1") ctx.fillRect(x + c * P, y + (r + oy) * P, P, P);
  };
  stamp(DINO_BODY, 0);
  ctx.fillStyle = PAL.bg;
  ctx.fillRect(x + 8 * P, y + 1 * P, P, P);
  ctx.fillStyle = PAL.darkest;
  stamp(DINO_LEGS[legFrame] || DINO_LEGS[0], DINO_BODY.length);
}

// ===================== 스네이크 (Snake) =====================
export function createSnake() {
  const GRID = 12;
  const PAD = 8;
  let s = {};
  const reset = () => {
    s = {
      cells: [{ x: 4, y: 4 }, { x: 3, y: 4 }, { x: 2, y: 4 }],
      dir: { x: 1, y: 0 }, nextDir: { x: 1, y: 0 },
      food: { x: 9, y: 4 }, moveTimer: 0, moveEvery: 9,
      score: 0, best: s.best || 0, over: false, cols: 0, rows: 0,
    };
  };
  reset();

  const placeFood = () => {
    let ok = false;
    while (!ok) {
      s.food = { x: Math.floor(Math.random() * s.cols), y: Math.floor(Math.random() * s.rows) };
      ok = !s.cells.some((c) => c.x === s.food.x && c.y === s.food.y);
    }
  };

  return {
    title: "SNAKE",
    hint: "ARROWS",
    get over() { return s.over; },
    get score() { return s.score; },
    get best() { return s.best; },
    reset,
    input(type) {
      if (s.over) return;
      const d = s.dir;
      if (type === "up" && d.y === 0) s.nextDir = { x: 0, y: -1 };
      else if (type === "down" && d.y === 0) s.nextDir = { x: 0, y: 1 };
      else if (type === "left" && d.x === 0) s.nextDir = { x: -1, y: 0 };
      else if (type === "right" && d.x === 0) s.nextDir = { x: 1, y: 0 };
    },
    update(dt, W, H) {
      if (s.over) return;
      s.cols = Math.floor((W - PAD * 2) / GRID);
      s.rows = Math.floor((H - PAD * 2) / GRID);

      s.moveTimer += dt;
      if (s.moveTimer < s.moveEvery) return;
      s.moveTimer = 0;

      s.dir = s.nextDir;
      const head = { x: s.cells[0].x + s.dir.x, y: s.cells[0].y + s.dir.y };

      if (head.x < 0 || head.y < 0 || head.x >= s.cols || head.y >= s.rows ||
          s.cells.some((c) => c.x === head.x && c.y === head.y)) {
        s.over = true;
        if (s.score > s.best) s.best = s.score;
        return;
      }

      s.cells.unshift(head);
      if (head.x === s.food.x && head.y === s.food.y) {
        s.score += 1;
        placeFood();
        if (s.moveEvery > 4) s.moveEvery -= 0.2;
      } else {
        s.cells.pop();
      }
    },
    draw(ctx, W, H, PAL) {
      const cols = Math.floor((W - PAD * 2) / GRID);
      const rows = Math.floor((H - PAD * 2) / GRID);
      const ox = (W - cols * GRID) / 2;
      const oy = (H - rows * GRID) / 2;

      ctx.strokeStyle = PAL.dark;
      ctx.lineWidth = 2;
      ctx.strokeRect(ox - 2, oy - 2, cols * GRID + 4, rows * GRID + 4);

      ctx.fillStyle = PAL.dark;
      const fx = ox + s.food.x * GRID, fy = oy + s.food.y * GRID;
      ctx.fillRect(fx + 3, fy + 2, GRID - 6, GRID - 4);
      ctx.fillRect(fx + 2, fy + 3, GRID - 4, GRID - 6);

      ctx.fillStyle = PAL.darkest;
      s.cells.forEach((c, i) => {
        const x = ox + c.x * GRID, y = oy + c.y * GRID;
        ctx.fillRect(x + 1, y + 1, GRID - 2, GRID - 2);
        if (i === 0) {
          ctx.fillStyle = PAL.bg;
          ctx.fillRect(x + 3, y + 3, 2, 2);
          ctx.fillRect(x + GRID - 5, y + 3, 2, 2);
          ctx.fillStyle = PAL.darkest;
        }
      });
    },
  };
}

// ===================== 벽돌깨기 (Breakout) =====================
export function createBreakout() {
  let s = {};
  const reset = () => {
    s = {
      paddleX: 0.5,      // 0~1 비율
      ballX: 0, ballY: 0, // 픽셀 좌표 (update 첫 프레임에 초기화)
      vx: 0, vy: 0,
      launched: false,   // 발사 전엔 패들 위에 붙어있음
      bricks: [], inited: false,
      score: 0, best: s.best || 0, over: false,
    };
  };
  reset();

  const PADDLE_W = 0.26; // 화면폭 대비
  const BALL_R = 4;
  const SPEED = 2.6;     // 공 속도(픽셀/프레임 기준)

  const initBricks = (W) => {
    s.bricks = [];
    const cols = 6, rows = 3;
    const margin = 14;
    const bw = (W - margin * 2) / cols;
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++)
        s.bricks.push({ x: margin + c * bw, y: 30 + r * 13, w: bw - 4, h: 9, alive: true });
    s.inited = true;
  };

  const paddleRect = (W, H) => {
    const pw = W * PADDLE_W;
    return { px: s.paddleX * W, pw, py: H - 20, ph: 6 };
  };

  return {
    title: "BREAKOUT",
    hint: "MOVE + TAP",
    get over() { return s.over; },
    get score() { return s.score; },
    get best() { return s.best; },
    reset,
    input(type) {
      if (s.over) return;
      if (type === "left") s.paddleX = Math.max(PADDLE_W / 2, s.paddleX - 0.07);
      else if (type === "right") s.paddleX = Math.min(1 - PADDLE_W / 2, s.paddleX + 0.07);
      else if (type === "press" || type === "up") {
        if (!s.launched) { // 공 발사
          s.launched = true;
          s.vx = (Math.random() - 0.5) * 1.4;
          s.vy = -SPEED;
        }
      }
    },
    update(dt, W, H) {
      if (!s.inited) {
        initBricks(W);
        s.ballX = s.paddleX * W;
        s.ballY = H - 28;
      }
      if (s.over) return;

      const { px, pw, py, ph } = paddleRect(W, H);

      // 발사 전엔 공이 패들 위에 붙어있음
      if (!s.launched) {
        s.ballX = px;
        s.ballY = py - BALL_R - 2;
        return;
      }

      s.ballX += s.vx * dt;
      s.ballY += s.vy * dt;

      // 벽
      if (s.ballX < 8 + BALL_R) { s.ballX = 8 + BALL_R; s.vx = Math.abs(s.vx); }
      if (s.ballX > W - 8 - BALL_R) { s.ballX = W - 8 - BALL_R; s.vx = -Math.abs(s.vx); }
      if (s.ballY < 8 + BALL_R) { s.ballY = 8 + BALL_R; s.vy = Math.abs(s.vy); }

      // 패들 충돌 (위에서 내려올 때만)
      if (
        s.vy > 0 &&
        s.ballY + BALL_R >= py && s.ballY + BALL_R <= py + ph + 4 &&
        s.ballX >= px - pw / 2 && s.ballX <= px + pw / 2
      ) {
        s.vy = -Math.abs(s.vy);
        const hit = (s.ballX - px) / (pw / 2); // -1~1
        s.vx = hit * SPEED * 0.8; // 맞은 위치로 각도
        s.ballY = py - BALL_R - 1;
      }

      // 바닥 = 죽음
      if (s.ballY - BALL_R > H) {
        s.over = true;
        if (s.score > s.best) s.best = s.score;
        return;
      }

      // 벽돌 충돌
      for (const br of s.bricks) {
        if (!br.alive) continue;
        if (
          s.ballX + BALL_R > br.x && s.ballX - BALL_R < br.x + br.w &&
          s.ballY + BALL_R > br.y && s.ballY - BALL_R < br.y + br.h
        ) {
          br.alive = false;
          s.vy *= -1;
          s.score += 1;
          break; // 한 프레임에 하나만
        }
      }
      // 다 깨면 재생성 + 공 리셋
      if (s.bricks.every((br) => !br.alive)) {
        initBricks(W);
        s.launched = false;
      }
    },
    draw(ctx, W, H, PAL) {
      // 외곽
      ctx.strokeStyle = PAL.dark;
      ctx.lineWidth = 2;
      ctx.strokeRect(6, 6, W - 12, H - 12);
      // 벽돌
      for (const br of s.bricks) {
        if (!br.alive) continue;
        ctx.fillStyle = PAL.dark;
        ctx.fillRect(br.x, br.y, br.w, br.h);
        ctx.fillStyle = PAL.darkest;
        ctx.fillRect(br.x, br.y, br.w, 2);
      }
      // 패들
      const { px, pw, py, ph } = paddleRect(W, H);
      ctx.fillStyle = PAL.darkest;
      ctx.fillRect(px - pw / 2, py, pw, ph);
      // 공
      ctx.fillRect(s.ballX - BALL_R, s.ballY - BALL_R, BALL_R * 2, BALL_R * 2);
      // 발사 안내
      if (!s.launched) {
        ctx.fillStyle = PAL.dark;
        ctx.font = "12px 'Courier New', monospace";
        ctx.textAlign = "center";
        ctx.fillText("TAP TO LAUNCH", W / 2, H / 2);
        ctx.textAlign = "left";
      }
    },
  };
}

// ===================== 플래피 (Flappy) =====================
export function createFlappy() {
  let s = {};
  const reset = () => {
    s = {
      birdY: 0.45, vel: 0, pipes: [], spawnTimer: 0,
      score: 0, best: s.best || 0, over: false, started: false, wing: 0,
    };
  };
  reset();
  const PIPE_W = 26;

  return {
    title: "FLAPPY",
    hint: "TAP=FLAP",
    get over() { return s.over; },
    get score() { return s.score; },
    get best() { return s.best; },
    reset,
    input(type) {
      if (s.over) return;
      if (type === "press" || type === "up") {
        s.started = true;
        s.vel = -0.019;
        s.wing = 6;
      }
    },
    update(dt, W, H) {
      if (s.over || !s.started) return;
      const groundH = 14;
      s.vel += 0.0012 * dt;
      s.birdY += s.vel * dt;
      if (s.wing > 0) s.wing -= dt;

      const playH = (H - groundH) / H;
      if (s.birdY < 0.02 || s.birdY > playH - 0.02) {
        s.over = true;
        if (s.score > s.best) s.best = s.score;
        return;
      }

      for (const p of s.pipes) p.x -= 1.5 * dt;
      s.pipes = s.pipes.filter((p) => p.x > -PIPE_W - 5);

      s.spawnTimer -= dt;
      if (s.spawnTimer <= 0) {
        const gap = 0.36;
        const top = 0.12 + Math.random() * (playH - gap - 0.24);
        s.pipes.push({ x: W + 10, top, gap, passed: false });
        s.spawnTimer = 130;
      }

      const bx = W * 0.28, by = s.birdY * H, br = 6;
      for (const p of s.pipes) {
        const topPx = p.top * H, botPx = (p.top + p.gap) * H;
        if (bx + br > p.x && bx - br < p.x + PIPE_W) {
          if (by - br < topPx || by + br > botPx) {
            s.over = true;
            if (s.score > s.best) s.best = s.score;
          }
        }
        if (!p.passed && p.x + PIPE_W < bx) { p.passed = true; s.score += 1; }
      }
    },
    draw(ctx, W, H, PAL) {
      const groundH = 14;
      ctx.fillStyle = PAL.dark;
      for (const p of s.pipes) {
        const topPx = p.top * H, botPx = (p.top + p.gap) * H;
        ctx.fillRect(p.x, 0, PIPE_W, topPx);
        ctx.fillRect(p.x, botPx, PIPE_W, H - botPx - groundH);
        ctx.fillStyle = PAL.darkest;
        ctx.fillRect(p.x - 2, topPx - 8, PIPE_W + 4, 8);
        ctx.fillRect(p.x - 2, botPx, PIPE_W + 4, 8);
        ctx.fillStyle = PAL.dark;
      }
      ctx.fillStyle = PAL.darkest;
      ctx.fillRect(0, H - groundH, W, groundH);
      ctx.fillStyle = PAL.dark;
      for (let x = 0; x < W; x += 8) ctx.fillRect(x, H - groundH, 4, 3);
      ctx.fillStyle = PAL.darkest;
      const bx = W * 0.28, by = s.birdY * H;
      ctx.fillRect(bx - 6, by - 5, 12, 10);
      ctx.fillRect(bx - 9, by + (s.wing > 0 ? -3 : 1), 4, 4);
      ctx.fillRect(bx + 6, by - 1, 3, 3);
      ctx.fillStyle = PAL.bg;
      ctx.fillRect(bx + 1, by - 3, 2, 2);
    },
  };
}

// ===================== 테트리스 (BLOCKS) =====================
export function createTetris() {
  const COLS = 8, ROWS = 16;
  let s = {};
  const SHAPES = [
    [[1, 1, 1, 1]],
    [[1, 1], [1, 1]],
    [[0, 1, 0], [1, 1, 1]],
    [[1, 0], [1, 0], [1, 1]],
    [[0, 1], [0, 1], [1, 1]],
    [[1, 1, 0], [0, 1, 1]],
    [[0, 1, 1], [1, 1, 0]],
  ];
  const collide = (px, py, piece) => {
    for (let r = 0; r < piece.length; r++)
      for (let c = 0; c < piece[r].length; c++)
        if (piece[r][c]) {
          const x = px + c, y = py + r;
          if (x < 0 || x >= COLS || y >= ROWS) return true;
          if (y >= 0 && s.grid[y][x]) return true;
        }
    return false;
  };
  const spawn = () => {
    s.piece = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    s.px = Math.floor(COLS / 2) - 1;
    s.py = -1;
    if (collide(s.px, 0, s.piece)) s.over = true;
  };
  const reset = () => {
    s = {
      grid: Array.from({ length: ROWS }, () => Array(COLS).fill(0)),
      piece: null, px: 0, py: 0, dropTimer: 0, dropEvery: 32,
      score: 0, best: s.best || 0, over: false,
    };
    spawn();
  };
  const merge = () => {
    for (let r = 0; r < s.piece.length; r++)
      for (let c = 0; c < s.piece[r].length; c++)
        if (s.piece[r][c]) {
          const y = s.py + r, x = s.px + c;
          if (y >= 0) s.grid[y][x] = 1;
        }
    for (let r = ROWS - 1; r >= 0; r--) {
      if (s.grid[r].every((v) => v)) {
        s.grid.splice(r, 1);
        s.grid.unshift(Array(COLS).fill(0));
        s.score += 1;
        r++;
      }
    }
  };
  const rotate = (piece) => {
    const rows = piece.length, cols = piece[0].length;
    const out = Array.from({ length: cols }, () => Array(rows).fill(0));
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++) out[c][rows - 1 - r] = piece[r][c];
    return out;
  };
  reset();

  const layout = (W, H) => {
    const cell = Math.min((W - 16) / COLS, (H - 16) / ROWS);
    const bw = cell * COLS, bh = cell * ROWS;
    const ox = (W - bw) / 2, oy = (H - bh) / 2;
    return { cell, ox, oy, bw, bh };
  };

  return {
    title: "BLOCKS",
    hint: "LR  UP=ROT",
    get over() { return s.over; },
    get score() { return s.score; },
    get best() { return s.best; },
    reset,
    input(type) {
      if (s.over || !s.piece) return;
      if (type === "left" && !collide(s.px - 1, s.py, s.piece)) s.px--;
      else if (type === "right" && !collide(s.px + 1, s.py, s.piece)) s.px++;
      else if (type === "down") { if (!collide(s.px, s.py + 1, s.piece)) s.py++; }
      else if (type === "up" || type === "press") {
        const rot = rotate(s.piece);
        if (!collide(s.px, s.py, rot)) s.piece = rot;
      }
    },
    update(dt) {
      if (s.over) return;
      s.dropTimer += dt;
      if (s.dropTimer < s.dropEvery) return;
      s.dropTimer = 0;
      if (!collide(s.px, s.py + 1, s.piece)) {
        s.py++;
      } else {
        if (s.py < 0) { s.over = true; return; }
        merge();
        if (s.score > s.best) s.best = s.score;
        spawn();
      }
    },
    draw(ctx, W, H, PAL) {
      const { cell, ox, oy, bw, bh } = layout(W, H);

      ctx.fillStyle = PAL.light;
      ctx.fillRect(ox, oy, bw, bh);
      ctx.strokeStyle = PAL.darkest;
      ctx.lineWidth = 2;
      ctx.strokeRect(ox - 1, oy - 1, bw + 2, bh + 2);

      ctx.fillStyle = PAL.darkest;
      for (let r = 0; r < ROWS; r++)
        for (let c = 0; c < COLS; c++)
          if (s.grid[r][c]) ctx.fillRect(ox + c * cell + 1, oy + r * cell + 1, cell - 2, cell - 2);

      ctx.fillStyle = PAL.dark;
      if (s.piece)
        for (let r = 0; r < s.piece.length; r++)
          for (let c = 0; c < s.piece[r].length; c++)
            if (s.piece[r][c]) {
              const y = s.py + r;
              if (y >= 0) ctx.fillRect(ox + (s.px + c) * cell + 1, oy + y * cell + 1, cell - 2, cell - 2);
            }
    },
  };
}

export const GAME_FACTORIES = [
  { name: "DINO RUN", create: createDino },
  { name: "SNAKE", create: createSnake },
  { name: "BREAKOUT", create: createBreakout },
  { name: "FLAPPY", create: createFlappy },
  { name: "BLOCKS", create: createTetris },
];