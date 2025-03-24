import { ctx, CANVAS_HEIGHT_PX, CANVAS_WIDTH_PX } from './canvas';
// 26 dots wide
// 29 high

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
  dot: '#ffb897',
  wall: '#2121de',
  pacman: '#ffff00',
};

const board = boardS.split('\n');
board.pop();
board.shift();

const margin = 20;
const tileSize = (CANVAS_WIDTH_PX - margin) / 26;

ctx.font = '20px monospace';
ctx.textBaseline = 'middle';

export function drawBoard() {
  console.log(board, tileSize);
  board.forEach((row, y) => {
    row.split('').forEach((char, x) => {
      if (char === '*') ctx.fillStyle = colors.wall;
      else ctx.fillStyle = colors.dot;
      ctx.fillText(char, margin + x * tileSize, margin + y * tileSize);
    });
  });
}
