## Pacman — Copilot instructions

Quick, focused guidance to help an AI coding agent be productive in this repo.

- Project type: browser game written in TypeScript (ESM) and bundled with Parcel v2 (see `package.json`).
- Key entry: `src/index.html` loads `./main.ts` as a module.

What matters (big picture)

- The runtime is single-page, canvas-based. Rendering + game logic live in `src/main.ts` (tick loop, input, high level state).
- `src/consts.ts` is the canonical place for board layout, constants, and feature flags (DEBUG\_\*). Changing gameplay often means editing values here.
- `src/utils.ts` contains core game math and helpers: `gridToPx`, `pxToGrid`, `teleportCharacter`, `isThereCollision`, `getPacmanSpeed`, `getGhostSpeed`.
- `src/board.ts` and `src/sprites.ts` are purely rendering helpers — keep logic separate from drawing.
- `src/canvas.ts` sets up pixel scaling (devicePixelRatio \* 4) and exports `ctx` and canvas dimensions — do not bypass this scaling when drawing.

Data-flow & conventions to follow

- World state is stored in a few module-level mutable variables in `main.ts` (e.g., `pacmanPos`, `ghosts`, `board` from `consts.ts`). Many functions mutate this state directly.
- Positions are stored as pixel-centered coordinates (type `PxPos`) and converted to grid coordinates (`GridPos`) via `pxToGrid`/`gridToPx`.
- Speeds are expressed in pixels/second. Movement functions expect a delta in pixels (deltaPx) derived from delta time: deltaPx = speed \* deltaT / 1000.
- Collision tolerance and cell-centering use small epsilon values (0.5) — use the same checks when adding new collision logic.
- Board is a string array (`consts.board`). Eating a dot mutates the string in place in `main.ts` — follow the existing approach when modifying dots.

Important files & quick examples

- `src/main.ts` — game loop and input. Key functions: `tick(timestamp)`, `movePacman(deltaPx)`, `moveGhosts(deltaT, timestamp)`, `resetLife()`, `resetGameState()`.
  - Example: camera/physics timing: tick computes `deltaT = timestamp - lastTimestamp` and converts it to pixels for movement.
- `src/utils.ts` — helper examples:
  - Teleport tunnel: `teleportCharacter(direction, cell)` returns a {pos, cell} or null for tunnels at grid (0/31, y===14).
  - Speed functions: `getPacmanSpeed(level, isFright?)` and `getGhostSpeed(level, isFright?, isTunnel?)` — change these to tune difficulty.
- `src/consts.ts` — edit board layout string and constant flags (e.g., `DEBUG_GRID`, `DRAW_DOTS`).
- `src/canvas.ts` — canvas scale is applied via ctx.scale; maintain this to preserve pixel-art sharpness.
- `src/index.html` — DOM nodes used by game: `#score`, `#high-score`, `#ready`, `#game-over`, `#debug`, images with id `sprites` and `background`.

Dev workflow / commands

- Install deps (pnpm preferred because `pnpm-lock.yaml` exists):

```
pnpm install
pnpm start     # runs parcel dev server (script: "start": "parcel ./src/index.html")
pnpm build     # production build (script: "build": "parcel build ./src/index.html")
```

- npm/yarn will work too (fallback): `npm install && npm run start`.

Debugging and inspection

- Toggle in-game debugging via flags in `src/consts.ts`: `DEBUG_GRID`, `DEBUG_DOTS`, `DEBUG_PACMAN`.
- When `DEBUG_GRID` is enabled the code exposes `window.currentCell`, `window.nextCell`, and `window.debugDot` for quick inspection — tests or quick manual assertions can use those.
- Score/high-score is persisted in `localStorage` (key `highScore`) — clearing it is useful when testing new scoring logic.

Patterns & stylistic rules for edits

- Keep logic and rendering separate. Prefer adding logic in `main.ts` / `utils.ts` and drawing in `board.ts`/`sprites.ts`.
- Preserve mutable global state patterns rather than converting to full functional/reactive architecture. Small, local refactors are fine, but large rewrites should be discussed.
- Use exported types from `src/types.ts` (`PxPos`, `GridPos`, `Direction`, `Ghost`, `GhostName`) to keep signatures consistent.
- Use existing helper functions (grid/px conversions, teleport) rather than duplicating math.

Integration & assets

- Assets live in `assets/` and are referenced from `src/index.html` (spritesheet, background, sounds). Parcel will copy them to the dist output.
- No external server/API integrations — this is a standalone client-side game.

Small extra notes for PRs

- When changing game speed or timings, include before/after screenshots or a short GIF showing the difference.
- When touching `consts.ts` board layout, ensure line indexing and `TOP_MARGIN` are considered — tests are manual (no automated tests present).

If something seems missing (e.g., preferred package manager, CI, or test expectations) ask: "Do you prefer pnpm or npm workflows? Should I add a simple unit test harness for core utils like `pxToGrid` and `teleportCharacter`?"

---

Files worth opening first: `src/main.ts`, `src/consts.ts`, `src/utils.ts`, `src/canvas.ts`, `src/sprites.ts`, `src/board.ts`, `src/index.html`.
