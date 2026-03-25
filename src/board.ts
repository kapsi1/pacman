import { ctx, TOP_MARGIN, SCREEN_WIDTH, SCREEN_HEIGHT, pixelRatio } from './canvas';
import { CELL_SIZE, DEBUG_DOTS, DEBUG_GRID, DOT_SIZE, DRAW_DOTS, WALL_MARGIN, board } from './consts';
import { gridToPx } from './utils';

ctx.font = '4px monospace';

const colors = {
  background: 'black',
  dot: '#ffb897',
  wall: '#2121de',
};

// ── Off-screen canvas ─────────────────────────────────────────────────────────
// Same physical resolution as the main canvas; context scaled the same way.
// Built once at load, then single dots/energizers are erased as they are eaten.

const offCanvas = document.createElement('canvas');
offCanvas.width  = SCREEN_WIDTH  * pixelRatio;
offCanvas.height = SCREEN_HEIGHT * pixelRatio;
const offCtx = offCanvas.getContext('2d') as CanvasRenderingContext2D;
offCtx.imageSmoothingEnabled = false;
offCtx.scale(pixelRatio, pixelRatio);

function drawEnergizerToCtx(targetCtx: CanvasRenderingContext2D, x: number, y: number) {
  targetCtx.rect(x + 2, y, 4, 8);
  targetCtx.rect(x + 1, y + 1, 6, 6);
  targetCtx.rect(x, y + 2, 8, 4);
}

function buildOffscreenCanvas() {
  offCtx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
  offCtx.fillStyle = colors.dot;
  offCtx.beginPath();
  board.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const char = row[x];
      const dotX = WALL_MARGIN + x * CELL_SIZE + CELL_SIZE / 2;
      const dotY = TOP_MARGIN + WALL_MARGIN + y * CELL_SIZE + CELL_SIZE / 2;
      if (char === '.') {
        offCtx.rect(dotX - DOT_SIZE / 2, dotY - DOT_SIZE / 2, DOT_SIZE, DOT_SIZE);
      } else if (char === 'o') {
        drawEnergizerToCtx(offCtx, dotX - DOT_SIZE * 2, dotY - DOT_SIZE * 2);
      }
    }
  });
  offCtx.fill();
}

buildOffscreenCanvas();

export function eraseDotAt(gridX: number, gridY: number) {
  const dotX = WALL_MARGIN + gridX * CELL_SIZE + CELL_SIZE / 2;
  const dotY = TOP_MARGIN + WALL_MARGIN + gridY * CELL_SIZE + CELL_SIZE / 2;
  offCtx.clearRect(dotX - DOT_SIZE / 2, dotY - DOT_SIZE / 2, DOT_SIZE, DOT_SIZE);
}

export function eraseEnergizerAt(gridX: number, gridY: number) {
  const dotX = WALL_MARGIN + gridX * CELL_SIZE + CELL_SIZE / 2;
  const dotY = TOP_MARGIN + WALL_MARGIN + gridY * CELL_SIZE + CELL_SIZE / 2;
  // Energizer bounding box is 8×8 logical pixels (DOT_SIZE*2 = 4 on each side).
  offCtx.clearRect(dotX - DOT_SIZE * 2, dotY - DOT_SIZE * 2, DOT_SIZE * 4, DOT_SIZE * 4);
}

// ── Debug fallback (original per-frame iteration) ─────────────────────────────

function drawEnergizer(x: number, y: number) {
  ctx.rect(x + 2, y, 4, 8);
  ctx.rect(x + 1, y + 1, 6, 6);
  ctx.rect(x, y + 2, 8, 4);
}

function drawDots() {
  ctx.fillStyle = colors.dot;
  ctx.strokeStyle = colors.dot;
  ctx.beginPath();
  board.forEach((row, y) => {
    row.split('').forEach((char, x) => {
      if (DEBUG_DOTS) ctx.beginPath();
      ctx.fillStyle = colors.dot;
      // dotX and dotY points are centers of cells
      const dotX = WALL_MARGIN + x * CELL_SIZE + CELL_SIZE / 2;
      const dotY = TOP_MARGIN + WALL_MARGIN + y * CELL_SIZE + CELL_SIZE / 2;
      if (DRAW_DOTS) {
        if (char === '.') {
          ctx.rect(dotX - DOT_SIZE / 2, dotY - DOT_SIZE / 2, DOT_SIZE, DOT_SIZE);
        }
        if (char === 'o') {
          drawEnergizer(dotX - DOT_SIZE * 2, dotY - DOT_SIZE * 2);
        }
      }
      if (DEBUG_DOTS) {
        ctx.fillStyle = char === '#' ? 'red' : 'green';
        ctx.rect(dotX - DOT_SIZE / 2, dotY - DOT_SIZE / 2, DOT_SIZE, DOT_SIZE);
        ctx.fill();
      }
      if (DEBUG_GRID) {
        ctx.lineWidth = 0.1;
        ctx.strokeStyle = 'gray';
        ctx.strokeRect(dotX - CELL_SIZE / 2, dotY - CELL_SIZE / 2, CELL_SIZE, CELL_SIZE);
        ctx.fillStyle = char === '#' ? '#ba000045' : '#00a3184a';
        ctx.fillRect(dotX - CELL_SIZE / 2, dotY - CELL_SIZE / 2, CELL_SIZE, CELL_SIZE);
        ctx.fillStyle = 'white';
        if (x === 2 || x === row.length - 3) ctx.fillText(y.toString(), dotX, dotY);
        if (x > 0 && (y === board.length - 1 || y === 0)) ctx.fillText(x.toString(), dotX, dotY);
      }
    });
  });
  ctx.fill();

  if (DEBUG_GRID && (window as any).currentCell) {
    const pos = gridToPx((window as any).currentCell);
    ctx.fillStyle = 'blue';
    ctx.beginPath();
    ctx.rect(pos.x - CELL_SIZE / 2, pos.y - CELL_SIZE / 2, CELL_SIZE, CELL_SIZE);
    ctx.fill();
  }
  if (DEBUG_GRID && (window as any).nextCell) {
    const pos = gridToPx((window as any).nextCell);
    ctx.fillStyle = 'gray';
    ctx.beginPath();
    ctx.rect(pos.x - CELL_SIZE / 2, pos.y - CELL_SIZE / 2, CELL_SIZE, CELL_SIZE);
    ctx.fill();
  }
  if (DEBUG_GRID && (window as any).debugDot) {
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.rect((window as any).debugDot[0], (window as any).debugDot[1], 2, 2);
    ctx.fill();
  }
}

// ── Public draw entry point ───────────────────────────────────────────────────

export function drawBoard() {
  if (DEBUG_DOTS || DEBUG_GRID) {
    drawDots();
    return;
  }
  // Blit the pre-rendered off-screen canvas.
  // Source: full physical bitmap; Dest: full logical screen.
  // ctx has an active pixelRatio scale, so the logical dest (SCREEN_WIDTH ×
  // SCREEN_HEIGHT) maps to the same physical pixels as the offCanvas bitmap.
  ctx.drawImage(
    offCanvas,
    0, 0, offCanvas.width, offCanvas.height,
    0, 0, SCREEN_WIDTH, SCREEN_HEIGHT,
  );
}
