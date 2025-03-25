const CANVAS_WIDTH_PX = 224;
const CANVAS_HEIGHT_PX = 288;
const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

canvas.setAttribute('width', CANVAS_WIDTH_PX.toString());
canvas.setAttribute('height', CANVAS_HEIGHT_PX.toString());

export { ctx, CANVAS_WIDTH_PX, CANVAS_HEIGHT_PX };
