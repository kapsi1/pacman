import { TOP_MARGIN } from './canvas';
import { WALL_MARGIN, CELL_SIZE } from './consts';
import { Direction, GridPos, PxPos } from './types';

export const isHorizontalDirection = (direction: Direction) =>
  direction === Direction.Left || direction === Direction.Right;
// const gridToPx = (gridX: number, gridY: number) => [
//   WALL_MARGIN + gridX * CELL_SIZE,
//   TOP_MARGIN + WALL_MARGIN + gridY * CELL_SIZE,
// ];
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
// get coordinates of top left corner of the cell containing the point
export const getCellCornerFromPoint = (pxPos: PxPos): PxPos => {
  const gridPos = pxToGrid(pxPos);
  const cellCenter = gridToPx(gridPos);
  return {
    x: cellCenter.x - CELL_SIZE / 2,
    y: cellCenter.y - CELL_SIZE / 2,
  };
};
