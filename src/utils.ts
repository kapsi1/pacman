import { TOP_MARGIN } from './canvas';
import { WALL_MARGIN, CELL_SIZE, board } from './consts';
import { Direction, GridPos, PxPos } from './types';

export const isHorizontalDirection = (direction: Direction) =>
  direction === Direction.Left || direction === Direction.Right;

// Returns middle point of the cell
export function gridToPx(gridPos: GridPos): PxPos {
  return {
    x: WALL_MARGIN + gridPos.x * CELL_SIZE + CELL_SIZE / 2,
    y: TOP_MARGIN + WALL_MARGIN + gridPos.y * CELL_SIZE + CELL_SIZE / 2,
  };
}

export function pxToGrid(pxPos: PxPos): GridPos {
  return {
    x: Math.floor((pxPos.x - WALL_MARGIN) / CELL_SIZE),
    y: Math.floor((pxPos.y - WALL_MARGIN - TOP_MARGIN) / CELL_SIZE),
  };
}

export function pointDistance(point1: PxPos, point2: PxPos) {
  return Math.sqrt(Math.pow(point1.x - point2.x, 2) + Math.pow(point1.y - point2.y, 2));
}

export function isCellAllowed(gridPos: GridPos) {
  if (!board[gridPos.y]) return false;
  if (!board[gridPos.y][gridPos.x]) return false;
  if (board[gridPos.y][gridPos.x] === '#') return false;
  return true;
}

export function getNextCell(gridPos: GridPos, direction: Direction) {
  let x = gridPos.x;
  let y = gridPos.y;
  if (direction === Direction.Down) y++;
  else if (direction === Direction.Up) y--;
  else if (direction === Direction.Left) x--;
  else if (direction === Direction.Right) x++;
  return { x, y };
}
