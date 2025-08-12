import { Direction, GhostName } from './types';

export const STARTING_LIVES = 3;
export const NEW_LIFE_EVERY_POINTS = 10_000;

export const WALL_MARGIN = 0;
export const CELL_SIZE = 8;
export const DOT_SIZE = 2;

// Milliseconds
export const DIRECTION_CHANGE_BUFFER_TIME = 500;
export const PACMAN_ANIMATION_FRAME_LENGTH = 70;
export const GHOST_ANIMATION_FRAME_LENGTH = 300;
export const PACMAN_DEATH_FRAME_LENGTH = 150;
export const PAUSE_AFTER_DEATH = 3_000;

// Pixels / second
// export const CHARACTER_SPEED = 1;
// export const CHARACTER_SPEED = 5;
// export const CHARACTER_SPEED = 20;
export const CHARACTER_SPEED = 60; // default

export const DEBUG_DOTS = false;
// export const DEBUG_DOTS = true;

export const DRAW_DOTS = true;
// export const DRAW_DOTS = false;

export const DEBUG_GRID = false;
// export const DEBUG_GRID = true;

export const DEBUG_PACMAN = false;
// export const DEBUG_PACMAN = true;

const boardS = `
  ############################  
  #............##............#  
  #.####.#####.##.#####.####.#  
  #o####.#####.##.#####.####o#  
  #.####.#####.##.#####.####.#  
  #..........................#  
  #.####.##.########.##.####.#  
  #.####.##.########.##.####.#  
  #......##....##....##......#  
  ######.##### ## #####.######  
       #.##### ## #####.#       
       #.##          ##.#       
       #.## ######## ##.#       
########.## #      # ##.########
        .   #      #   .        
########.## #      # ##.########
       #.## ######## ##.#       
       #.##          ##.#       
       #.## ######## ##.#       
  ######.## ######## ##.######  
  #............##............#  
  #.####.#####.##.#####.####.#  
  #.####.#####.##.#####.####.#  
  #o..##.......  .......##..o#  
  ###.##.##.########.##.##.###  
  ###.##.##.########.##.##.###  
  #......##....##....##......#  
  #.##########.##.##########.#  
  #.##########.##.##########.#  
  #..........................#  
  ############################  `;

export const board = boardS.split('\n');
board.shift();

export const PACMAN_START_POS = { x: 15, y: 23 };
export const PACMAN_START_DIR = Direction.Right;
export const GHOST_STARTS = [
  { name: GhostName.Blinky, pos: { x: 120, y: 116 }, direction: Direction.Left, lastChangedDirection: 0 },
  { name: GhostName.Inky, pos: { x: 136, y: 116 }, direction: Direction.Right, lastChangedDirection: 0 },
  { name: GhostName.Pinky, pos: { x: 120, y: 164 }, direction: Direction.Left, lastChangedDirection: 0 },
  { name: GhostName.Clyde, pos: { x: 136, y: 164 }, direction: Direction.Right, lastChangedDirection: 0 },
];
