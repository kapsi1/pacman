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
};
