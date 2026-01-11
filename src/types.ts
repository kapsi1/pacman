export enum GhostMode {
  Scatter = 'scatter',
  Chase = 'chase',
}

export enum Direction {
  Left = 'left',
  Up = 'up',
  Right = 'right',
  Down = 'down',
}

export type GridPos = {
  x: number;
  y: number;
};

export type PxPos = {
  x: number;
  y: number;
};

export enum GhostName {
  Blinky = 'Blinky',
  Pinky = 'Pinky',
  Inky = 'Inky',
  Clyde = 'Clyde',
}

export type Ghost = {
  name: GhostName;
  pos: PxPos;
  direction: Direction;
  lastChangedDirection: number;
  inPen: boolean;
  dotLimit?: number;
  canLeave: boolean;
  speed: number;
  frightened: boolean;
  isEyes: boolean;
};

export interface PacmanState {
  pos: PxPos;
  dir: Direction;
  nextDir: Direction | null;
  speed: number;
  pauseTimeRemaining: number;
  isCornering: boolean;
  frame: 0 | 1 | 2;
  lastFrameTimestamp: number;
}
