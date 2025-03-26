import { ctx, TOP_MARGIN } from './canvas';

export const WALL_MARGIN = 11; // distance from wall
export const DOT_GAP = 8;

// const DEBUG_DOTS = true;
const DEBUG_DOTS = false;

// game board is 26 tiles wide and 29 tiles high
const boardS = `
............##............
.####.#####.##.#####.####.
o#  #.#   #.##.#   #.#  #o
.####.#####.##.#####.####.
..........................
.####.##.########.##.####.
.####.##.########.##.####.
......##....##....##......
#####.##### ## #####.#####
    #.##### ## #####.#    
    #.##          ##.#    
    #.## ######## ##.#    
#####.## #      # ##.#####
     .   #      #   .     
#####.## #      # ##.#####
    #.## ######## ##.#    
    #.##          ##.#    
    #.## ######## ##.#    
#####.## ######## ##.#####
............##............
.####.#####.##.#####.####.
.####.#####.##.#####.####.
o..##.......  .......##..o
##.##.##.########.##.##.##
##.##.##.########.##.##.##
......##....##....##......
.##########.##.##########.
.##########.##.##########.
..........................
`;

const colors = {
  background: 'black',
  dot: '#ffb897',
  wall: '#2121de',
};

export const board = boardS.split('\n');
board.pop();
board.shift();

function bigDot(x: number, y: number) {
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
      if (char === '.') {
        // console.log('x', x, 'dotX', WALL_MARGIN + x * DOT_GAP);
        ctx.rect(dotX, dotY, dotSize, dotSize);
      }
      if (char === 'o') {
        bigDot(dotX - 3, dotY - 3);
      }
      if (DEBUG_DOTS) {
        ctx.fillStyle = char === '#' ? 'red' : 'green';
        if (y === 19 && x === 11) ctx.fillStyle = 'yellow';
        ctx.rect(dotX, dotY, dotSize, dotSize);
        ctx.fill();
      }
    });
  });
  ctx.fill();
}

export function drawBoard() {
  drawDots();
}
