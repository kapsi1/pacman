import { ctx, CANVAS_HEIGHT_PX, CANVAS_WIDTH_PX } from './canvas';

// game board is 26 tiles wide and 29 tiles high
const boardS = `
............**............
.****.*****.**.*****.****.
o****.*****.**.*****.****o
.****.*****.**.*****.****.
..........................
.****.**.********.**.****.
.****.**.********.**.****.
......**....**....**......
*****.***** ** *****.*****
    *.**          **.*    
    *.**          **.*    
    *.**          **.*    
    *.**          **.*    
*****.**          **.*****
`;

const colors = {
  background: 'black',
  dot: '#ffb897',
  wall: '#2121de',
  pacman: '#ffff00',
};

const board = boardS.split('\n');
board.pop();
board.shift();
const fullWidth = CANVAS_WIDTH_PX;
const fullHeight = CANVAS_HEIGHT_PX;

function outerWall() {
  // left
  ctx.moveTo(0.5, 4);
  ctx.lineTo(0.5, fullHeight - 4);
  // top left corner
  ctx.moveTo(1.5, 4);
  ctx.lineTo(1.5, 2);
  ctx.moveTo(2, 1.5);
  ctx.lineTo(4, 1.5);
  // top
  ctx.moveTo(4, 0.5);
  ctx.lineTo(fullWidth - 4, 0.5);
  // top right corner
  ctx.moveTo(fullWidth - 4, 1.5);
  ctx.lineTo(fullWidth - 2, 1.5);
  ctx.moveTo(fullWidth - 1.5, 2);
  ctx.lineTo(fullWidth - 1.5, 4);
  // right
  ctx.moveTo(fullWidth - 0.5, 4);
  ctx.lineTo(fullWidth - 0.5, fullHeight - 4);
  // bottom right corner
  ctx.moveTo(fullWidth - 1.5, fullHeight - 4);
  ctx.lineTo(fullWidth - 1.5, fullHeight - 2);
  ctx.moveTo(fullWidth - 2, fullHeight - 1.5);
  ctx.lineTo(fullWidth - 4, fullHeight - 1.5);
  // bottom
  ctx.moveTo(fullWidth - 4, fullHeight - 0.5);
  ctx.lineTo(4, fullHeight - 0.5);
  // bottom left corner
  ctx.moveTo(4, fullHeight - 1.5);
  ctx.lineTo(2, fullHeight - 1.5);
  ctx.moveTo(1.5, fullHeight - 2);
  ctx.lineTo(1.5, fullHeight - 4);
}

function rect(x: number, y: number, w: number, h: number, skipWall?: string) {
  // top
  if (skipWall !== 'top') {
    ctx.moveTo(x + 2, y + 0.5);
    ctx.lineTo(x + w - 1, y + 0.5);
    // top right corner
    ctx.fillRect(x + w - 1, y + 1, 1, 1);
    // top left corner
    ctx.fillRect(x + 1, y + 1, 1, 1);
  }
  // right
  ctx.moveTo(x + w + 0.5, y + 2);
  ctx.lineTo(x + w + 0.5, y + h);
  // bottom right corner
  ctx.fillRect(x + w - 1, y + h, 1, 1);
  // bottom
  ctx.moveTo(x + w - 1, y + h + 1.5);
  ctx.lineTo(x + 2, y + h + 1.5);
  // bottom left corner
  ctx.fillRect(x + 1, y + h, 1, 1);
  // left
  ctx.moveTo(x + 0.5, y + h);
  ctx.lineTo(x + 0.5, y + 2);
}

function drawWalls() {
  const lineWidth = 1;
  const outerWallSpacing = 3;
  ctx.strokeStyle = colors.wall;
  ctx.fillStyle = colors.wall;
  ctx.lineWidth = lineWidth;
  ctx.beginPath();
  // outer outer
  outerWall();
  // outer inner
  rect(
    0 + outerWallSpacing,
    0 + outerWallSpacing,
    fullWidth - lineWidth - 2 * outerWallSpacing,
    fullHeight - 2 * outerWallSpacing - 2 * lineWidth
  );
  // top row of rectangles
  rect(20, 20, 23, 14);
  rect(60, 20, 31, 14);
  rect(132, 20, 31, 14);
  rect(180, 20, 23, 14);
  ctx.stroke();

  // top vertical wall
  ctx.strokeStyle = colors.background;
  ctx.beginPath();
  ctx.moveTo(107, 3.5);
  ctx.lineTo(117, 3.5);
  ctx.stroke();
  ctx.fillRect(107, 4, 1, 1);
  ctx.fillRect(116, 4, 1, 1);
  ctx.strokeStyle = colors.wall;
  ctx.beginPath();
  rect(108, 3, 7, 31, 'top');

  // second row of walls
  // left rectangle
  rect(20, 51, 23, 7);
  // left T
  // middle T
  // right T
  // right rectangle
  rect(180, 51, 23, 7);
  ctx.stroke();
}

function bigDot(x: number, y: number) {
  // 8 x 8
  ctx.rect(x + 2, y, 4, 8);
  ctx.rect(x + 1, y + 1, 6, 6);
  ctx.rect(x, y + 2, 8, 4);
}

function drawDots() {
  const margin = 11;
  const dotSize = 2;
  const dotGap = 8;
  ctx.strokeStyle = colors.dot;
  ctx.fillStyle = colors.dot;
  ctx.beginPath();
  board.forEach((row, y) => {
    row.split('').forEach((char, x) => {
      if (char === '.') {
        ctx.rect(margin + x * dotGap, margin + y * dotGap, dotSize, dotSize);
      }
      if (char === 'o') {
        bigDot(margin + x * dotGap - 3, margin + y * dotGap - 3);
      }
    });
  });
  ctx.fill();
}

export function drawBoard() {
  drawWalls();
  drawDots();
}
