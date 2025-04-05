const SCREEN_WIDTH = 224;
const SCREEN_HEIGHT = 288;
const TOP_MARGIN = 24;
const BOTTOM_MARGIN = 16;
const BOARD_HEIGHT = SCREEN_HEIGHT - TOP_MARGIN - BOTTOM_MARGIN; // 248 px
const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

// canvas.setAttribute('width', SCREEN_WIDTH.toString());
// canvas.setAttribute('height', SCREEN_HEIGHT.toString());

const ratio = 4 * window.devicePixelRatio;
canvas.setAttribute('width', (SCREEN_WIDTH * ratio).toString());
canvas.setAttribute('height', (SCREEN_HEIGHT * ratio).toString());
// canvas.style.setProperty('width', SCREEN_WIDTH.toString() + 'px');
// canvas.style.setProperty('height', SCREEN_HEIGHT.toString() + 'px');
ctx.scale(ratio, ratio);

ctx.textAlign = 'center';
ctx.textBaseline = 'middle';
ctx.imageSmoothingEnabled = false;

export { ctx, SCREEN_WIDTH, SCREEN_HEIGHT, TOP_MARGIN, BOTTOM_MARGIN, BOARD_HEIGHT };
