import { ctx, TOP_MARGIN } from './canvas';

export const WALL_MARGIN = 4; // distance from wall
export const DOT_GAP = 8;

// const DEBUG_DOTS = true;
const DEBUG_DOTS = false;
const DRAW_DOTS = true;
// const DRAW_DOTS = false;
// const DEBUG_GRID = true;
const DEBUG_GRID = false;
ctx.font = '4px monospace';

// game board is 26 tiles wide and 29 tiles high
const boardS = `
             #             
 ............# ............
 .### .#### .# .#### .### .
 o### .#### .# .#### .### o
 .    .     .  .     .    .
 ..........................
 .### .# .####### .# .### .
 .    .# .   #    .# .    .
 ......# ....# ....# ......
##### .####  #  #### .#####
    # .#           # .#    
    # .#           # .#    
##### .#  #######  # .#####
      .   #     #    .     
      .   #     #    .     
##### .#  #######  # .#####
    # .#           # .#    
    # .#           # .#    
##### .#  #######  # .#####
      .      #       .     
 ............# ............
 .### .#### .# .#### .### .
 .  # .     .  .     .#   .
 o..# .......  .......# ..o
## .# .# .####### .# .# .##
   .# .# .   #    .# .  .  
 ......# ....# ....# ......
 .######### .# .######### .
 .          .  .          .
 ..........................`;

const colors = {
  background: 'black',
  dot: '#ffb897',
  wall: '#2121de',
};

export const board = boardS.split('\n');
board.shift();

function coin(x: number, y: number) {
  // 8 x 8
  ctx.rect(x + 2, y, 4, 8);
  ctx.rect(x + 1, y + 1, 6, 6);
  ctx.rect(x, y + 2, 8, 4);
}

function drawDots() {
  const dotSize = 2;
  ctx.fillStyle = colors.dot;
  ctx.strokeStyle = colors.dot;
  ctx.beginPath();
  board.forEach((row, y) => {
    // console.log('y', y, 'row', row);
    // console.log('dotY', TOP_MARGIN + WALL_MARGIN + y * DOT_GAP);
    row.split('').forEach((char, x) => {
      if (DEBUG_DOTS) ctx.beginPath();
      ctx.fillStyle = colors.dot;
      const dotX = WALL_MARGIN + x * DOT_GAP;
      const dotY = TOP_MARGIN + WALL_MARGIN + y * DOT_GAP;
      if (DRAW_DOTS) {
        if (char === '.') {
          ctx.rect(dotX, dotY, dotSize, dotSize);
        }
        if (char === 'o') {
          coin(dotX - 3, dotY - 3);
        }
      }
      if (DEBUG_DOTS) {
        ctx.fillStyle = char === '#' ? 'red' : 'green';
        ctx.rect(dotX, dotY, dotSize, dotSize);
        ctx.fill();
      }
      if (DEBUG_GRID) {
        ctx.lineWidth = 0.1;
        ctx.strokeStyle = 'gray';
        ctx.strokeRect(dotX, dotY, DOT_GAP, DOT_GAP);
        ctx.fillStyle = char === '#' ? '#ba000045' : '#00a3184a';
        ctx.fillRect(dotX, dotY, DOT_GAP, DOT_GAP);
        ctx.fillStyle = 'white';
        if (x === 0 || x === row.length - 1) ctx.fillText(y.toString(), dotX + 4, dotY + 4);
        if (x > 0 && (y === board.length - 1 || y === 0)) ctx.fillText(x.toString(), dotX + 4, dotY + 4);
      }
    });
  });
  ctx.fill();
  if (DEBUG_GRID && (window as any).currentCell) {
    const c = (window as any).currentCell;
    ctx.fillStyle = 'blue';
    ctx.beginPath();
    ctx.rect(c[0], c[1], DOT_GAP, DOT_GAP);
    ctx.fill();
  }
  if (DEBUG_GRID && (window as any).nextCell) {
    const c = (window as any).nextCell;
    ctx.fillStyle = 'gray';
    ctx.beginPath();
    ctx.rect(c[0], c[1], DOT_GAP, DOT_GAP);
    ctx.fill();
  }
  if (DEBUG_GRID && (window as any).debugDot) {
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.rect((window as any).debugDot[0], (window as any).debugDot[1], 2, 2);
    ctx.fill();
  }
}

export function drawBoard() {
  drawDots();
}
