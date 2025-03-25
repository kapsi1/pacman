const SCREEN_WIDTH = 224;
const SCREEN_HEIGHT = 288;
const TOP_MARGIN = 24; // score area; 8.333% of SCREEN_HEIGHT
const BOTTOM_MARGIN = 16; // pacmen left, fruit; 5.555% of SCREEN_HEIGHT
const BOARD_HEIGHT = SCREEN_HEIGHT - TOP_MARGIN - BOTTOM_MARGIN; // 248 px
const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

canvas.setAttribute('width', SCREEN_WIDTH.toString());
canvas.setAttribute('height', SCREEN_HEIGHT.toString());

ctx.textAlign = 'center';
ctx.textBaseline = 'middle';

export { ctx, SCREEN_WIDTH, SCREEN_HEIGHT, TOP_MARGIN, BOTTOM_MARGIN, BOARD_HEIGHT };
