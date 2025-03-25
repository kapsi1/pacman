import { ctx, CANVAS_HEIGHT_PX, CANVAS_WIDTH_PX } from './canvas';

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

// game board is 26 tiles wide, 29 tiles high
const fullWidth = CANVAS_WIDTH_PX;
const fullHeight = CANVAS_HEIGHT_PX;
const gridWidth = 26;
const gridHeight = 29;
const lineWidth = 1;
const cornerRadius = 3;
const outerWallSpacing = 3;
const innerWidth = CANVAS_WIDTH_PX - 2 * (outerWallSpacing + 4 * lineWidth);
const tileSize = Math.floor(innerWidth / gridWidth);
console.log('tileSize', tileSize);

const innerMargin = lineWidth / 2 + outerWallSpacing / 2;
// const innerMargin = 0;
const midWidth = innerWidth / 2;

function drawOuterWall() {
  ctx.strokeStyle = colors.wall;
  ctx.beginPath();
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
  ctx.stroke();
}

function rect(x: number, y: number, w: number, h: number) {
  ctx.strokeStyle = colors.wall;
  ctx.fillStyle = colors.wall;
  ctx.beginPath();
  // top
  ctx.moveTo(x + 2, y + 0.5);
  ctx.lineTo(x + w - 1, y + 0.5);
  // top right corner
  ctx.fillRect(x + w - 1, y + 1, 1, 1);
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
  // top left corner
  ctx.fillRect(x + 1, y + 1, 1, 1);
  ctx.stroke();
}

function drawWalls() {
  const topY = (tileOffset: number) => innerMargin + tileOffset * tileSize;
  const leftX = (tileOffset: number) => innerMargin + tileOffset * tileSize;

  // ctx.strokeStyle = colors.wall;
  // ctx.fillStyle = colors.background;
  // ctx.fillStyle = 'red';
  ctx.lineWidth = lineWidth;

  // outer walls
  // ctx.roundRect(lineWidth / 2, lineWidth / 2, fullWidth - lineWidth, tileSize * gridHeight - lineWidth, cornerRadius);
  // ctx.roundRect(lineWidth / 2, lineWidth / 2, fullWidth - lineWidth, fullHeight - lineWidth, cornerRadius);
  // ctx.roundRect(
  //   lineWidth / 2 + outerWallSpacing,
  //   lineWidth / 2 + outerWallSpacing,
  //   fullWidth - lineWidth - 2 * outerWallSpacing,
  //   tileSize * gridHeight - lineWidth,
  //   cornerRadius
  // );
  // outer outer
  // rect(0, 0, fullWidth - lineWidth, fullHeight - 2 * lineWidth);
  drawOuterWall();
  // outer inner
  rect(
    0 + outerWallSpacing,
    0 + outerWallSpacing,
    fullWidth - lineWidth - 2 * outerWallSpacing,
    fullHeight - 2 * outerWallSpacing - 2 * lineWidth
  );
  // middle indentations
  // left
  ctx.roundRect(leftX(0), topY(9), 5 * tileSize, 4 * tileSize, cornerRadius);
  ctx.roundRect(
    leftX(0),
    topY(9) + outerWallSpacing,
    5 * tileSize - outerWallSpacing,
    4 * tileSize - 2 * outerWallSpacing,
    cornerRadius
  );
  ctx.stroke();
  // ctx.roundRect(
  //   leftX(0),
  //   topY(9) + 2 * outerWallInnerSpacing,
  //   5 * tileSize - outerWallInnerSpacing,
  //   4 * tileSize - 4 * outerWallInnerSpacing,
  //   cornerRadius
  // );
  // right
  // ctx.roundRect(leftX(22) - outerWallInnerSpacing, topY(9), 5 * tileSize, 4 * tileSize, cornerRadius);
  // ctx.roundRect(
  //   leftX(22),
  //   topY(9) + 2 * outerWallInnerSpacing,
  //   5 * tileSize,
  //   4 * tileSize - 2 * outerWallInnerSpacing,
  //   cornerRadius
  // );

  // top row of walls
  // ctx.roundRect(leftX(2), topY(2), 3 * tileSize, 2 * tileSize, cornerRadius);
  // ctx.roundRect(leftX(7), topY(2), 4 * tileSize, 2 * tileSize, cornerRadius);
  // ctx.roundRect(midWidth + tileSize / 4 + 0.5, lineWidth, tileSize, tileSize * 4 + 3, cornerRadius);
  // ctx.roundRect(leftX(16), topY(2), 4 * tileSize, 2 * tileSize, cornerRadius);
  // ctx.roundRect(leftX(22), topY(2), 3 * tileSize, 2 * tileSize, cornerRadius);

  // rect(leftX(2), topY(2), 3 * tileSize, 2 * tileSize);
  // rect(leftX(7), topY(2) + 2, 4 * tileSize, 1.5 * tileSize + 1);
  // rect(leftX(16), topY(2), 4 * tileSize, 2 * tileSize);
  // rect(leftX(22), topY(2), 3 * tileSize, 2 * tileSize);

  // top row of rectangles
  // short 23 x 15, wide 31 x 15
  rect(20, 20, 23, 15);
  rect(60, 20, 31, 15);
  rect(132, 20, 31, 15);
  rect(180, 20, 23, 15);

  // second row of walls
  // leftmost
  ctx.roundRect(leftX(2), topY(6), 3 * tileSize, tileSize, cornerRadius);
  // left T
  ctx.roundRect(leftX(7), topY(6), tileSize, 7 * tileSize, cornerRadius);
  ctx.roundRect(leftX(7), topY(9), 4 * tileSize, tileSize, cornerRadius);
  // middle T
  ctx.roundRect(leftX(10), topY(6), 7 * tileSize, tileSize, cornerRadius);
  ctx.roundRect(midWidth + tileSize / 4, topY(6), tileSize, tileSize * 4 + 3, cornerRadius);
  ctx.stroke();
  // right T
  ctx.beginPath();
  ctx.roundRect(leftX(16), topY(9), 4 * tileSize, tileSize, cornerRadius);
  ctx.stroke();
  ctx.beginPath();
  ctx.roundRect(leftX(19), topY(6), tileSize, 7 * tileSize, cornerRadius);
  ctx.stroke();
  ctx.beginPath();
  ctx.roundRect(leftX(19) + 1, topY(6) + 2, tileSize - 2, 7 * tileSize - 4, cornerRadius);
  ctx.fill();
  ctx.beginPath();
  ctx.roundRect(leftX(16) + 2, topY(9) + 1, 4 * tileSize - 4, tileSize - 2, cornerRadius);
  ctx.fill();
  // rightmost
  ctx.beginPath();
  ctx.roundRect(leftX(22), topY(6), 3 * tileSize, tileSize, cornerRadius);
  ctx.stroke();
}

export function drawBoard() {
  // const marginLeft = innerMargin + 17;
  // const marginTop = innerMargin + 17;
  const marginLeft = 10;
  const marginTop = 10;
  const dotSize = 2;
  const bigDotRadius = 3.5;
  drawWalls();
  ctx.beginPath();
  ctx.strokeStyle = colors.dot;
  ctx.fillStyle = colors.dot;
  board.forEach((row, y) => {
    row.split('').forEach((char, x) => {
      if (char === '.') {
        console.log(marginLeft + x * tileSize + 1, marginTop + y * tileSize + 1);

        ctx.rect(marginLeft + x * tileSize + 1, marginTop + y * tileSize + 1, dotSize, dotSize);
      }
      if (char === 'o') {
        ctx.arc(marginLeft + x * tileSize + 2.5, marginTop + y * tileSize + 2, bigDotRadius, 0, 2 * Math.PI);
      }
    });
  });
  ctx.fill();
}
