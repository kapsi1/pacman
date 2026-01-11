# Pac-Man Game Mechanics (from The Pac-Man Dossier)

This document serves as a comprehensive reference for the internal mechanics of Pac-Man, extracted from *The Pac-Man Dossier*. It details ghost behaviors, target tile logic, speed specifications, and known bugs.

## 1. Ghost Personalities, Names, and Behaviors

Each ghost has a unique personality and method for calculating its target tile during **Chase** mode.

| Color | Name | Character | Behavior (Chase Mode) |
| :--- | :--- | :--- | :--- |
| **Red** | **Blinky** | Shadow / "Oikake" | **Pursuit:** Targets Pac-Man's exact tile. He is the most direct and aggressive. |
| **Pink** | **Pinky** | Speedy / "Machibuse" | **Ambush:** Aims for 4 tiles ahead of Pac-Man’s current direction to cut him off. (Note: Due to a bug, if Pac-Man faces UP, the target is 4 tiles UP and 4 tiles LEFT). |
| **Cyan** | **Inky** | Bashful / "Kimagure" | **Whimsical:** Targets a tile calculated using Blinky's position and Pac-Man's position (specifically, 2 tiles ahead of Pac-Man). The vector from Blinky to that point is doubled to find Inky's target. |
| **Orange**| **Clyde** | Pokey / "Otoboke" | **Feigning Ignorance:** Targets Pac-Man if > 8 tiles away; retreats to his "home corner" (bottom-left) if closer (< 8 tiles). |

## 2. Target Tiles and Modes

The ghosts operate in three distinct modes: **Scatter**, **Chase**, and **Frightened**.

### Scatter Mode
During Scatter mode, ghosts head for fixed "home corners" located just outside the maze boundaries. They cannot reach these tiles, so they circle the area.
*   **Blinky:** Top-Right corner.
*   **Pinky:** Top-Left corner.
*   **Inky:** Bottom-Right corner.
*   **Clyde:** Bottom-Left corner.

### Mode Shifting Logic
*   Ghosts reverse direction automatically whenever they shift from Scatter to Chase or vice-versa.
*   **Level 1 Pattern:** Scatter (7s) -> Chase (20s) -> Scatter (7s) -> Chase (20s) -> Scatter (5s) -> Chase (20s) -> Scatter (5s) -> Chase (indefinitely).
*   **Levels 2-4:** Similar timing, but the final Scatter is only 1/60th of a second (effectively just a direction reversal).
*   **Level 5+:** Scatter periods are significantly reduced or removed in later levels.

## 3. Speed Specifications

Speeds are percentages of the base "normal" speed.

*   **Pac-Man:**
    *   Level 1: 80%
    *   Level 5-20: 100%
    *   Level 21+: 90%
    *   *Penalty:* Slows by 1 frame per dot eaten, 3 frames per energizer.
*   **Ghosts:**
    *   Generally 75%-95% speed.
    *   Always slower than Pac-Man until Level 21+.
    *   At Level 21+, Ghosts move at 95% while Pac-Man moves at 90%.
    *   *Tunnel Speed:* Ghosts slow to ~40-50% when in the side tunnel.
*   **Frightened Ghost:** Much slower than normal (approx 50-60% depending on level).

## 4. Movement and Pathfinding

*   **Look-Ahead:** Ghosts look one tile ahead to decide their next move.
*   **Intersections:** Ghosts choose the direction that minimizes the straight-line distance (Euclidean geometry) to their current target tile.
*   **Tie-Breaker:** If two directions are equal distance to the target, the priority order is: UP > LEFT > DOWN > RIGHT.
*   **No Reversals:** Ghosts cannot reverse direction 180 degrees unless the mode changes (Scatter/Chase/Frightened).
*   **No Turn Up:** Ghosts are forbidden from turning UP at four specific T-junctions near the ghost house (unless frightened).

## 5. Frightened Mode

Triggered when an energizer is eaten.
*   Ghosts turn dark blue and reverse direction immediately.
*   Movement logic changes to **Pseudo-Random**. At each intersection, a PRNG determines the direction.
*   Scoring: 200 -> 400 -> 800 -> 1600 points for consecutive ghosts eaten.

## 6. Level Specifications

*   **Total Dots:** 244 (240 small dots + 4 energizers).
*   **Fruit:** Appears at 70 dots and 170 dots. Despawns if not eaten.
*   **Ghost Blue Time:** Decreases as levels progress.
    *   Level 19+: Ghosts do not turn blue (but still reverse).

## 7. Known Bugs and Quirks

*   **Kill Screen (Level 256):** 8-bit integer overflow causes the fruit drawing routine to loop 256 times, corrupting the right side of the maze.
*   **Pinky's Up/Left Bug:** As mentioned, targeting 4 tiles ahead of Pac-Man when he faces UP also adds a 4-tile LEFT offset due to an overflow error in the original code.
*   **Pass-Through Bug:** If Pac-Man and a ghost enter the same tile on the exact same frame from opposite directions, they pass through each other without collision.
*   **Cruise Elroy:** Blinky speeds up when dots remain (e.g., < 20 dots). He eventually moves faster than Pac-Man. In this state, he ignores Scatter mode.
