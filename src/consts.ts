import { Direction, GhostName } from './types';
import { getGhostSpeed } from './utils';

export const INITIAL_LIVES = 3;
// export const INITIAL_LIVES = 1;
export const NEW_LIFE_EVERY_POINTS = 10_000;

export const WALL_MARGIN = 0;
export const CELL_SIZE = 8;
export const DOT_SIZE = 2;

// Milliseconds
export const DIRECTION_CHANGE_BUFFER_TIME = 500;
export const PACMAN_ANIMATION_FRAME_LENGTH = 70;
export const GHOST_ANIMATION_FRAME_LENGTH = 300;
export const PACMAN_DEATH_FRAME_LENGTH = 150;
export const STARTING_PAUSE = 2_000;

// Wait 10 frames, play death animation, wait another 10 frames
export const DEATH_ANIMATION_FRAMES = 10;
export const DEATH_ANIMATION_START_PAUSE_FRAMES = 10;
export const DEATH_ANIMATION_END_PAUSE_FRAMES = 10;
export const DEATH_ANIMATION_TOTAL_FRAMES =
  DEATH_ANIMATION_FRAMES + DEATH_ANIMATION_START_PAUSE_FRAMES + DEATH_ANIMATION_END_PAUSE_FRAMES;

// Pixels / second
export const FULL_SPEED = 75.75757625;

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
export const PACMAN_START_DIR = Direction.Left;

export const GHOST_PEN_CENTER_X = 128;
export const GHOST_PEN_CENTER_Y = 140;
export const GHOST_PEN_EXIT_Y = 116;
export const GHOST_PEN_TOP_WALL_Y = 135;
export const GHOST_PEN_BOTTOM_WALL_Y = 145;
const GHOST_PEN_SPEED = 30;
export const GHOST_STARTS = [
  {
    name: GhostName.Blinky,
    pos: { x: GHOST_PEN_CENTER_X, y: GHOST_PEN_EXIT_Y },
    direction: Direction.Left,
    speed: getGhostSpeed(1),
  },
  { name: GhostName.Inky, pos: { x: 112, y: GHOST_PEN_CENTER_Y }, direction: Direction.Up, speed: GHOST_PEN_SPEED },
  {
    name: GhostName.Pinky,
    pos: { x: GHOST_PEN_CENTER_X, y: GHOST_PEN_CENTER_Y },
    direction: Direction.Up,
    speed: GHOST_PEN_SPEED,
  },
  { name: GhostName.Clyde, pos: { x: 144, y: GHOST_PEN_CENTER_Y }, direction: Direction.Up, speed: GHOST_PEN_SPEED },
];
