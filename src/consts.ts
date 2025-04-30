export const WALL_MARGIN = 0;
export const CELL_SIZE = 8;
export const DOT_SIZE = 2;

export const DIRECTION_CHANGE_BUFFER_TIME = 500;
export const PACMAN_ANIMATION_FRAME_LENGTH = 70;
export const GHOST_ANIMATION_FRAME_LENGTH = 300;
// export const CHARACTER_SPEED = 1; // px/s
// export const CHARACTER_SPEED = 5; // px/s
// export const CHARACTER_SPEED = 20; // px/s
export const CHARACTER_SPEED = 60; // px/s // default

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
