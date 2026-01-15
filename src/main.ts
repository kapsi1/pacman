import { Direction, GhostMode, GhostName } from "./types";
import type { Ghost, GridPos, PacmanState, PxPos } from "./types";
import {
	CELL_SIZE,
	GHOST_ANIMATION_FRAME_LENGTH,
	GHOST_STARTS,
	NEW_LIFE_EVERY_POINTS,
	PACMAN_ANIMATION_FRAME_LENGTH,
	PACMAN_DEATH_FRAME_LENGTH,
	PACMAN_START_DIR,
	PACMAN_START_POS,
	STARTING_PAUSE,
	INITIAL_LIVES,
	board,
	DEATH_ANIMATION_TOTAL_FRAMES,
	DEATH_ANIMATION_START_PAUSE_FRAMES,
	GHOST_PEN_CENTER_X,
	GHOST_PEN_EXIT_Y,
	GHOST_PEN_BOTTOM_WALL_Y,
	GHOST_PEN_TOP_WALL_Y,
	EAT_DOT_PAUSE_MS,
	EAT_ENERGIZER_PAUSE_MS,
	FRIGHTENED_DURATION_MS,
	GHOST_PEN_CENTER_Y,
	TUNNEL_Y,
	TUNNEL_X_MIN,
	TUNNEL_X_MAX,
	COLLISION_DISTANCE,
	GHOST_MODE_PATTERN_L1,
	GHOST_MODE_PATTERN_L2_L4,
	GHOST_MODE_PATTERN_L5_PLUS,
	GHOST_EATEN_PAUSE_MS,
} from "./consts";
import { ctx, SCREEN_HEIGHT, SCREEN_WIDTH } from "./canvas";
import { drawBoard } from "./board";
import {
	drawPacman,
	drawGhosts,
	drawDeathAnimation,
	drawLives,
} from "./sprites";

import {
	gridToPx,
	isHorizontalDir,
	pxToGrid,
	pointDistance,
	getNextCell,
	isCellAllowed,
	offsetPos,
	getAllowedDirections,
	teleportCharacter,
	isThereCollision,
	updateScore,
	hideReadyText,
	showGameOver,
	hideGameOver,
	showReadyText,
	getPacmanSpeed,
	getGhostSpeed,
	getBestDirection,
	getGhostTarget,
} from "./utils";
import { initSounds, playSound, stopSound, stopAllBackgroundSounds, setMuted } from "./audio";

const epsilon = 0.5;

interface GameState {
	isPaused: boolean;
	isGameOver: boolean;
	score: number;
	lives: number;
	level: number;
	dotsEaten: number;
	lastLifeScore: number;
	isCollision: boolean;
	lastTimestamp: number | null;
	frightenedModeExpiresAt: number | null;
	ghostMode: GhostMode;
	ghostModeIndex: number;
	ghostModeTimer: number;
	ghostsEatenThisEnergizer: number;
	isWaitingForFirstStart: boolean;
}

interface AnimationState {
	ghostFrame: 0 | 1;
	deathAnimationFrame: number;
	lastGhostFrameTimestamp: number;
	lastDeathFrameTimestamp: number;
	ghostEatenPauseTimer: number;
	ghostEatenScore: number;
	ghostEatenPos: PxPos | null;
}

const gameState: GameState = {
	isPaused: false,
	isGameOver: false,
	score: 0,
	lives: INITIAL_LIVES,
	level: 1,
	dotsEaten: 0,
	lastLifeScore: 0,
	isCollision: false,
	lastTimestamp: null,
	frightenedModeExpiresAt: null,
	ghostMode: GhostMode.Scatter,
	ghostModeIndex: 0,
	ghostModeTimer: 0,
	ghostsEatenThisEnergizer: 0,
	isWaitingForFirstStart: true,
};

let userMuted = false;

function toggleMute() {
	userMuted = !userMuted;
	updateMuteState();
}

function updateMuteState() {
	// Internal mute state (for background loops) is true if game is paused OR user muted
	setMuted(userMuted || gameState.isPaused);
	
	const muteBtn = document.querySelector("#mute-button");
	if (muteBtn) {
		muteBtn.textContent = userMuted ? "UNMUTE" : "MUTE";
	}
}

const muteBtn = document.querySelector("#mute-button");
if (muteBtn) {
	muteBtn.addEventListener("click", (e) => {
		e.stopPropagation();
		toggleMute();
	});
}



const pacman: PacmanState = {
	pos: gridToPx(PACMAN_START_POS),
	dir: PACMAN_START_DIR,
	nextDir: null,
	speed: getPacmanSpeed(1),
	pauseTimeRemaining: 0,
	isCornering: false,
	frame: 0,
	lastFrameTimestamp: 0,
};

const anim: AnimationState = {
	ghostFrame: 0,
	deathAnimationFrame: 0,
	lastGhostFrameTimestamp: 0,
	lastDeathFrameTimestamp: 0,
	ghostEatenPauseTimer: 0,
	ghostEatenScore: 0,
	ghostEatenPos: null,
};

let ghosts: Ghost[] = [];

function resetLife() {
	gameState.isPaused = true;
	updateMuteState();
	anim.deathAnimationFrame = 0;

	anim.lastGhostFrameTimestamp = 0;
	anim.lastDeathFrameTimestamp = 0;
	gameState.lastTimestamp = null;
	gameState.dotsEaten = 0;
	gameState.isCollision = false;
	gameState.frightenedModeExpiresAt = null;
	gameState.ghostMode = GhostMode.Scatter;
	gameState.ghostModeIndex = 0;
	gameState.ghostModeTimer = 0;
	gameState.ghostsEatenThisEnergizer = 0;

	anim.ghostEatenPauseTimer = 0;
	anim.ghostEatenScore = 0;
	anim.ghostEatenPos = null;

	pacman.pos = gridToPx(PACMAN_START_POS);
	pacman.pos.x += 3;
	pacman.dir = PACMAN_START_DIR;
	pacman.nextDir = null;
	pacman.isCornering = false;
	pacman.pauseTimeRemaining = 0;
	pacman.frame = 0;
	pacman.lastFrameTimestamp = 0;

	ghosts = JSON.parse(JSON.stringify(GHOST_STARTS));
	ghosts.forEach((ghost) => {
		ghost.lastChangedDirection = 0;
		ghost.isEyes = false;
		ghost.inPen = ghost.name !== GhostName.Blinky;
		switch (ghost.name) {
			case GhostName.Pinky:
				ghost.dotLimit = 7;
				break;
			case GhostName.Inky:
				ghost.dotLimit = 17;
				break;
			case GhostName.Clyde:
				ghost.dotLimit = 32;
				break;
		}
	});

	showReadyText();
	drawEverything(0);
	initSounds();
	updateMuteState();
	const startSound = playSound('start', userMuted);

	const startGame = () => {
		hideReadyText();
		gameState.isPaused = false;
		updateMuteState();
		requestAnimationFrame(tick);
	};

	if (startSound) {
		startSound.onended = startGame;
		// Fallback in case onended doesn't fire for some reason
		setTimeout(() => {
			if (gameState.isPaused) startGame();
		}, STARTING_PAUSE + 1000);
	} else {
		setTimeout(startGame, STARTING_PAUSE);
	}
}



function resetGameState() {
	gameState.isGameOver = false;
	gameState.score = 0;
	gameState.lives = INITIAL_LIVES;
	gameState.lastLifeScore = 0;
	gameState.level = 1;
	pacman.speed = getPacmanSpeed(gameState.level);

	ghosts.forEach((ghost) => {
		ghost.frightened = false;
		ghost.isEyes = false;
		switch (ghost.name) {
			case GhostName.Pinky:
				delete ghost.dotLimit;
				ghost.canLeave = true;
				break;
			case GhostName.Inky:
				if (gameState.level === 1) ghost.dotLimit = 30;
				break;
			case GhostName.Clyde:
				if (gameState.level === 1) ghost.dotLimit = 90;
				else if (gameState.level === 2) ghost.dotLimit = 50;
				break;
		}
	});
	updateScore("00");
	hideGameOver();
	updateMuteState();
	
	if (gameState.isWaitingForFirstStart) {

		showReadyText(); // Reuse READY text or add a separate one later
		const readyEl = document.querySelector("#ready") as HTMLDivElement;
		if (readyEl) readyEl.textContent = "CLICK TO START";
		
		const startHandler = () => {
			document.removeEventListener("click", startHandler);
			document.removeEventListener("keydown", startHandler);
			gameState.isWaitingForFirstStart = false;
			if (readyEl) readyEl.textContent = "READY!";
			initSounds();
			resetLife();
		};
		document.addEventListener("click", startHandler);
		document.addEventListener("keydown", startHandler);
	} else {
		resetLife();
	}
}

function getOppositeDir(dir: Direction): Direction {
	if (dir === Direction.Up) return Direction.Down;
	if (dir === Direction.Down) return Direction.Up;
	if (dir === Direction.Left) return Direction.Right;
	return Direction.Right;
}

function updateGhostInPen(ghost: Ghost) {
	if (ghost.dotLimit && gameState.dotsEaten >= ghost.dotLimit) {
		ghost.canLeave = true;
		if (ghost.pos.x > GHOST_PEN_CENTER_X) ghost.direction = Direction.Left;
		else if (ghost.pos.x < GHOST_PEN_CENTER_X)
			ghost.direction = Direction.Right;
		else ghost.direction = Direction.Up;
		delete ghost.dotLimit;
	}

	if (ghost.canLeave) {
		// When ghost inside pen reaches middle point, go up
		if (Math.abs(ghost.pos.x - GHOST_PEN_CENTER_X) <= epsilon) {
			ghost.direction = Direction.Up;
			ghost.pos.x = GHOST_PEN_CENTER_X;
		}
		// When it reaches the cell above exit, it goes left and is no longer in the pen
		if (Math.abs(ghost.pos.y - GHOST_PEN_EXIT_Y) <= epsilon) {
			ghost.inPen = false;
			ghost.pos.y = GHOST_PEN_EXIT_Y;
			ghost.direction = Direction.Left;
			ghost.speed = getGhostSpeed(gameState.level);
		}
	} else {
		// If it can't leave, bounce between walls
		if (ghost.pos.y < GHOST_PEN_TOP_WALL_Y) {
			ghost.direction = Direction.Down;
		} else if (ghost.pos.y > GHOST_PEN_BOTTOM_WALL_Y) {
			ghost.direction = Direction.Up;
		}
	}
}

function updateGhostEyes(ghost: Ghost, timestamp: number) {
	const penExit: PxPos = { x: GHOST_PEN_CENTER_X, y: GHOST_PEN_EXIT_Y };
	const distToExit = pointDistance(ghost.pos, penExit);

	if (distToExit <= epsilon) {
		ghost.isEyes = false;
		ghost.inPen = true;
		ghost.canLeave = true;
		ghost.direction = Direction.Up;
		ghost.pos = { x: GHOST_PEN_CENTER_X, y: GHOST_PEN_CENTER_Y };
		ghost.speed = getGhostSpeed(gameState.level);
		return;
	}

	const ghostGridPos: GridPos = pxToGrid(ghost.pos);
	const cellCenter: PxPos = gridToPx(ghostGridPos);
	const distanceToCellCenter = pointDistance(ghost.pos, cellCenter);

	if (distanceToCellCenter <= epsilon) {
		const { isIntersection, allowedDirections } = getAllowedDirections(ghost);
		if (isIntersection) {
			ghost.direction = getBestDirection(ghost, penExit, allowedDirections);
			ghost.lastChangedDirection = timestamp;
			if (isHorizontalDir(ghost.direction)) {
				ghost.pos.y = Math.round(ghost.pos.y);
			} else {
				ghost.pos.x = Math.round(ghost.pos.x);
			}
		}
	}
}

function updateGhostNormal(ghost: Ghost, timestamp: number) {
	const ghostGridPos = pxToGrid(ghost.pos);
	const teleportedPos = teleportCharacter(ghost.direction, ghostGridPos);

	if (teleportedPos !== null) {
		ghost.pos = teleportedPos.pos;
		return;
	}

	const cellCenter = gridToPx(ghostGridPos);
	const distanceToCellCenter = pointDistance(ghost.pos, cellCenter);

	if (distanceToCellCenter <= epsilon) {
		const { isIntersection, allowedDirections } = getAllowedDirections(ghost);
		if (isIntersection) {
			const blinky = ghosts.find((g) => g.name === GhostName.Blinky);
			const blinkyPos = blinky ? blinky.pos : ghost.pos;
			const target = getGhostTarget(ghost, pacman, blinkyPos, gameState.ghostMode);
			ghost.direction = getBestDirection(ghost, target, allowedDirections);
			ghost.lastChangedDirection = timestamp;
			if (isHorizontalDir(ghost.direction)) {
				ghost.pos.y = Math.round(ghost.pos.y);
			} else {
				ghost.pos.x = Math.round(ghost.pos.x);
			}
		}
	}
}

function updateGhostMode(deltaT: number) {
	if (gameState.frightenedModeExpiresAt !== null) return;

	let pattern: { mode: string; duration: number }[];
	if (gameState.level === 1) pattern = GHOST_MODE_PATTERN_L1;
	else if (gameState.level >= 2 && gameState.level <= 4)
		pattern = GHOST_MODE_PATTERN_L2_L4;
	else pattern = GHOST_MODE_PATTERN_L5_PLUS;

	const currentStep = pattern[gameState.ghostModeIndex];
	if (!currentStep) return;

	gameState.ghostModeTimer += deltaT;

	if (gameState.ghostModeTimer >= currentStep.duration) {
		gameState.ghostModeIndex++;
		const nextStep = pattern[gameState.ghostModeIndex];
		if (nextStep) {
			gameState.ghostMode = nextStep.mode as GhostMode;
			gameState.ghostModeTimer = 0;
			// All ghosts reverse direction when mode changes
			ghosts.forEach((ghost) => {
				if (!ghost.inPen && !ghost.isEyes) {
					ghost.direction = getOppositeDir(ghost.direction);
				}
			});
		}
	}
}

function moveGhosts(deltaT: number, timestamp: number) {
	for (let i = 0; i < ghosts.length; i++) {
		const ghost = ghosts[i];
		if (ghost.lastChangedDirection === 0)
			ghost.lastChangedDirection = timestamp;

		const deltaPx = (ghost.speed * deltaT) / 1000;
		//Prevent changing directions multiple times on intersections
		const minDeltaT = (1 / ghost.speed) * 1000 * 4;

		if (ghost.inPen) {
			updateGhostInPen(ghost);
		} else if (ghost.isEyes) {
			updateGhostEyes(ghost, timestamp);
		} else if (timestamp - ghost.lastChangedDirection > minDeltaT) {
			updateGhostNormal(ghost, timestamp);
		}

		ghost.pos = offsetPos(ghost.pos, deltaPx, ghost.direction);

		// Change speed in tunnel
		if (!ghost.inPen && ghost.pos.y === TUNNEL_Y) {
			if (ghost.pos.x < TUNNEL_X_MIN || ghost.pos.x > TUNNEL_X_MAX) {
				ghost.speed = getGhostSpeed(gameState.level, false, true);
			} else {
				ghost.speed = getGhostSpeed(gameState.level, false, false);
			}
		}
	}

	// Handle frightened mode expiration
	if (gameState.frightenedModeExpiresAt !== null && timestamp > gameState.frightenedModeExpiresAt) {
		gameState.frightenedModeExpiresAt = null;
		ghosts.forEach((ghost) => {
			if (ghost.isEyes) return;
			ghost.frightened = false;
			ghost.speed = getGhostSpeed(
				gameState.level,
				false,
				ghost.pos.y === TUNNEL_Y && (ghost.pos.x < TUNNEL_X_MIN || ghost.pos.x > TUNNEL_X_MAX),
			);
		});
	}
}

function movePacman(deltaPx: number) {
	let newPos = { x: pacman.pos.x, y: pacman.pos.y };
	newPos = offsetPos(newPos, deltaPx, pacman.dir);
	const currentCell = pxToGrid(pacman.pos);

	// During cornering Pacman moves diagonally until he reaches
	// the centerline of the new direction's path
	if (pacman.isCornering) {
		const cellCenter = gridToPx(currentCell);
		const xOffset = pacman.pos.x - cellCenter.x;
		const yOffset = pacman.pos.y - cellCenter.y;

		if (!isHorizontalDir(pacman.dir)) {
			if (xOffset < -epsilon) newPos.x += deltaPx;
			if (xOffset > epsilon) newPos.x -= deltaPx;
			if (Math.abs(xOffset) <= epsilon) {
				newPos.x = Math.round(newPos.x);
				pacman.isCornering = false;
			}
		} else {
			if (yOffset < -epsilon) newPos.y += deltaPx;
			if (yOffset > epsilon) newPos.y -= deltaPx;
			if (Math.abs(yOffset) <= epsilon) {
				newPos.y = Math.round(newPos.y);
				pacman.isCornering = false;
			}
		}
	}

	if (pacman.nextDir) {
		const nextCell = getNextCell(currentCell, pacman.nextDir);
		if (isCellAllowed(nextCell)) {
			if (isHorizontalDir(pacman.dir) !== isHorizontalDir(pacman.nextDir)) {
				pacman.isCornering = true;
			}
			pacman.dir = pacman.nextDir;
			pacman.nextDir = null;
		}
	}

	let newCell = pxToGrid(newPos);
	const teleported = teleportCharacter(pacman.dir, newCell);
	if (teleported !== null) {
		newPos = teleported.pos;
		newCell = teleported.cell;
	}

	const nextCell = getNextCell(newCell, pacman.dir);
	let isAllowed = true;
	const isNextCellAllowed = isCellAllowed(nextCell);
	const distanceToNextCell = pointDistance(newPos, gridToPx(nextCell));
	if (!isNextCellAllowed && distanceToNextCell <= CELL_SIZE) {
		isAllowed = false;
	}

	if (isAllowed) {
		pacman.pos = newPos;
		handlePacmanCollisions(newCell);
	} else {
		if (isHorizontalDir(pacman.dir)) {
			pacman.pos.x = Math.round(pacman.pos.x);
		} else {
			pacman.pos.y = Math.round(pacman.pos.y);
		}
	}
	return isAllowed;
}

function handlePacmanCollisions(cell: GridPos) {
	let scoreChanged = false;
	const cellContent = board[cell.y]?.[cell.x];

	if (cellContent === ".") {
		gameState.score += 10;
		scoreChanged = true;
		gameState.dotsEaten++;
		pacman.pauseTimeRemaining += EAT_DOT_PAUSE_MS;
		if (gameState.dotsEaten % 2 === 0) playSound('dot1', userMuted);
		else playSound('dot2', userMuted);
	} else if (cellContent === "o") {
		gameState.score += 50;
		scoreChanged = true;
		gameState.ghostsEatenThisEnergizer = 0;
		pacman.pauseTimeRemaining += EAT_ENERGIZER_PAUSE_MS;
		playSound('energizer', userMuted);
		gameState.frightenedModeExpiresAt = performance.now() + FRIGHTENED_DURATION_MS;
		ghosts.forEach((ghost) => {
			ghost.frightened = true;
			ghost.direction = getOppositeDir(ghost.direction);
			ghost.speed = getGhostSpeed(gameState.level, true, false);
		});
	}

	if (scoreChanged) {
		updateScore(gameState.score.toString());
		const row = board[cell.y];
		board[cell.y] = row.substring(0, cell.x) + " " + row.substring(cell.x + 1);

		if (Math.floor(gameState.score / NEW_LIFE_EVERY_POINTS) > Math.floor(gameState.lastLifeScore / NEW_LIFE_EVERY_POINTS)) {
			gameState.lives++;
			gameState.lastLifeScore = gameState.score;
		}
	}
}

document.addEventListener("keydown", (event) => {
	if (gameState.isGameOver) {
		if (event.key === " ") resetGameState();
		return;
	}
	switch (event.key) {
		case "`":
		case " ":
			gameState.isPaused = !gameState.isPaused;
			updateMuteState();
			if (!gameState.isPaused) {
				gameState.lastTimestamp = null;
				requestAnimationFrame(tick);
			}
			break;

		case "w":
		case "ArrowUp":
			if (pacman.dir === Direction.Up) return;
			pacman.nextDir = Direction.Up;
			break;
		case "s":
		case "ArrowDown":
			if (pacman.dir === Direction.Down) return;
			pacman.nextDir = Direction.Down;
			break;
		case "d":
		case "ArrowRight":
			if (pacman.dir === Direction.Right) return;
			pacman.nextDir = Direction.Right;
			break;
		case "a":
		case "ArrowLeft":
			if (pacman.dir === Direction.Left) return;
			pacman.nextDir = Direction.Left;
			break;
	}
});

function handleGhostEating() {
	const collidedGhost = ghosts.find(
		(g) => !g.isEyes && pointDistance(g.pos, pacman.pos) <= COLLISION_DISTANCE,
	);
	if (collidedGhost?.frightened) {
		gameState.ghostsEatenThisEnergizer++;
		const scoreGained = Math.pow(2, gameState.ghostsEatenThisEnergizer) * 100;
		gameState.score += scoreGained;
		updateScore(gameState.score.toString());

		collidedGhost.frightened = false;
		collidedGhost.isEyes = true;
		collidedGhost.speed = getGhostSpeed(gameState.level, false, false, true);

		playSound('eatGhost', userMuted);
		anim.ghostEatenPauseTimer = GHOST_EATEN_PAUSE_MS;
		anim.ghostEatenScore = scoreGained;
		anim.ghostEatenPos = { ...collidedGhost.pos };

		return true;
	}
	return false;
}

function handleDeathAnimation(timestamp: number) {
	const collidedGhost = ghosts.find(
		(g) => !g.isEyes && pointDistance(g.pos, pacman.pos) <= COLLISION_DISTANCE,
	);
	if (!collidedGhost || collidedGhost.isEyes) return;

	if (timestamp - anim.lastDeathFrameTimestamp > PACMAN_DEATH_FRAME_LENGTH) {
		if (anim.deathAnimationFrame === 0) {
			stopAllBackgroundSounds();
			playSound('death', userMuted);
		}
		anim.lastDeathFrameTimestamp = timestamp;
		anim.deathAnimationFrame++;
		if (anim.deathAnimationFrame > DEATH_ANIMATION_TOTAL_FRAMES) {
			gameState.lives--;
			if (gameState.lives > 0) {
				resetLife();
			} else {
				gameState.isPaused = true;
				gameState.isGameOver = true;
				updateMuteState();
				showGameOver();
			}

		}
	}
}

function tick(timestamp: number) {
	if (gameState.isPaused) return;
	if (gameState.lastTimestamp === null) gameState.lastTimestamp = timestamp;
	const deltaT = timestamp - gameState.lastTimestamp;
	gameState.lastTimestamp = timestamp;

	if (anim.ghostEatenPauseTimer > 0) {
		anim.ghostEatenPauseTimer -= deltaT;
		if (anim.ghostEatenPauseTimer < 0) anim.ghostEatenPauseTimer = 0;
		drawEverything(timestamp);
		requestAnimationFrame(tick);
		return;
	}

	updateGhostMode(deltaT);

	gameState.isCollision = isThereCollision(ghosts, pacman.pos);

	if (gameState.isCollision) {
		if (!handleGhostEating()) {
			handleDeathAnimation(timestamp);
		}
	} else {
		let effectiveDeltaT = deltaT;
		if (pacman.pauseTimeRemaining > 0) {
			effectiveDeltaT = Math.max(0, deltaT - pacman.pauseTimeRemaining);
			pacman.pauseTimeRemaining -= deltaT;
		}

		const deltaPx = (pacman.speed * effectiveDeltaT) / 1000;
		const pacmanMoved = movePacman(deltaPx);

		if (pacmanMoved && timestamp - pacman.lastFrameTimestamp > PACMAN_ANIMATION_FRAME_LENGTH) {
			pacman.lastFrameTimestamp = timestamp;
			pacman.frame++;
			if (pacman.frame > 2) pacman.frame = 0;
		}

		moveGhosts(deltaT, timestamp);

		// Audio management
		const hasEyes = ghosts.some(g => g.isEyes);
		const isFrightened = gameState.frightenedModeExpiresAt !== null;

		if (hasEyes) {
			stopSound('siren');
			stopSound('powerPellet');
			playSound('retreat', userMuted);
		} else if (isFrightened) {
			stopSound('siren');
			stopSound('retreat');
			playSound('powerPellet', userMuted);
		} else {
			stopSound('powerPellet');
			stopSound('retreat');
			playSound('siren', userMuted);
		}

		if (timestamp - anim.lastGhostFrameTimestamp > GHOST_ANIMATION_FRAME_LENGTH) {
			anim.lastGhostFrameTimestamp = timestamp;
			anim.ghostFrame++;
			if (anim.ghostFrame > 1) anim.ghostFrame = 0;
		}
	}

	drawEverything(timestamp);
	requestAnimationFrame(tick);
}

function drawEverything(timestamp: number) {
	ctx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
	drawBoard();
	drawLives(gameState.lives - 1);

	const showDeath = gameState.isCollision && anim.deathAnimationFrame >= DEATH_ANIMATION_START_PAUSE_FRAMES;

	if (showDeath) {
		drawDeathAnimation(pacman.pos, anim.deathAnimationFrame);
	} else if (anim.ghostEatenPauseTimer > 0 && anim.ghostEatenPos) {
		// Draw the gained score
		ctx.fillStyle = "cyan";
		ctx.font = "8px 'Press Start'";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillText(
			anim.ghostEatenScore.toString(),
			anim.ghostEatenPos.x,
			anim.ghostEatenPos.y,
		);
	} else {
		drawPacman(pacman.pos, pacman.dir, pacman.frame);
		drawGhosts(ghosts, anim.ghostFrame, gameState.frightenedModeExpiresAt, timestamp);
	}

	ctx.fillStyle = "black";
	ctx.fillRect(0, 0, 16, SCREEN_HEIGHT);
}

// Start game
resetGameState();
