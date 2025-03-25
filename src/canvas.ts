// 288 x 224;
const CANVAS_WIDTH_PX = 500;
const CANVAS_HEIGHT_PX = 600;
// const CANVAS_WIDTH_PX = 224;
// const CANVAS_HEIGHT_PX = 288;
const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

canvas.setAttribute('width', (CANVAS_WIDTH_PX * window.devicePixelRatio).toString());
canvas.style.setProperty('width', CANVAS_WIDTH_PX.toString() + 'px');
canvas.setAttribute('height', (CANVAS_HEIGHT_PX * window.devicePixelRatio).toString());
canvas.style.setProperty('height', CANVAS_HEIGHT_PX.toString() + 'px');
ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

// canvas.setAttribute('width', CANVAS_WIDTH_PX.toString());
// // canvas.style.setProperty('width', (CANVAS_WIDTH_PX * 2).toString() + 'px');
// canvas.setAttribute('height', CANVAS_HEIGHT_PX.toString());
// // canvas.style.setProperty('height', (CANVAS_HEIGHT_PX * 2).toString() + 'px');

ctx.textBaseline = 'middle';
ctx.textAlign = 'center';

export { ctx, CANVAS_WIDTH_PX, CANVAS_HEIGHT_PX };
