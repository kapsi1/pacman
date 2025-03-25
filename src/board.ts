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
const gridWidth = 26;
const gridHeight = 29;
const lineWidth = 2;
const cornerRadius = 9;
const outerWallSpacing = 5;
const innerWidth = CANVAS_WIDTH_PX - 2 * (outerWallSpacing + 4 * lineWidth);
const tileSize = innerWidth / gridWidth;
const innerMargin = lineWidth / 2 + outerWallSpacing / 2;
const midWidth = innerWidth / 2;

function drawWalls() {
  const topY = (tileOffset: number) => innerMargin + tileOffset * tileSize;
  const leftX = (tileOffset: number) => innerMargin + tileOffset * tileSize;

  ctx.strokeStyle = colors.wall;
  ctx.fillStyle = colors.background;
  // ctx.fillStyle = 'red';
  ctx.lineWidth = lineWidth;

  // outer walls
  ctx.roundRect(lineWidth / 2, lineWidth / 2, fullWidth - lineWidth, tileSize * gridHeight - lineWidth, cornerRadius);
  ctx.roundRect(
    lineWidth / 2 + outerWallSpacing,
    lineWidth / 2 + outerWallSpacing,
    fullWidth - lineWidth - 2 * outerWallSpacing,
    tileSize * gridHeight - lineWidth,
    cornerRadius
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
  ctx.roundRect(leftX(2), topY(2), 3 * tileSize, 2 * tileSize, cornerRadius);
  ctx.roundRect(leftX(7), topY(2), 4 * tileSize, 2 * tileSize, cornerRadius);
  ctx.roundRect(midWidth + tileSize / 4, lineWidth, tileSize, tileSize * 4 + 3, cornerRadius);
  ctx.roundRect(leftX(16), topY(2), 4 * tileSize, 2 * tileSize, cornerRadius);
  ctx.roundRect(leftX(22), topY(2), 3 * tileSize, 2 * tileSize, cornerRadius);

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
  const marginLeft = innerMargin + 17;
  const marginTop = innerMargin + 17;
  const dotSize = 4.5;
  const bigDotRadius = 8;
  drawWalls();
  ctx.beginPath();
  ctx.strokeStyle = colors.dot;
  ctx.fillStyle = colors.dot;
  board.forEach((row, y) => {
    row.split('').forEach((char, x) => {
      if (char === '.') {
        ctx.rect(marginLeft + x * tileSize, marginTop + y * tileSize, dotSize, dotSize);
      }
      if (char === 'o') {
        ctx.arc(marginLeft + x * tileSize + 2.5, marginTop + y * tileSize + 2, bigDotRadius, 0, 2 * Math.PI);
      }
    });
  });
  ctx.fill();
}
