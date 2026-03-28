import {
  BOARD_WIDTH,
  BOARD_SIZE,
  TOTAL_STONES,
  WIN_SCORE,
  DRAW_SCORE,
  type GameState,
  type MoveResult,
  type Score,
  type Side,
  type PieceMap,
  type PitState,
} from "./types";
import { initialBoard, stonesAt, emptyPit, addStones } from "./board";
import { createStone, createTuzdik } from "./piece";
import {
  positionSide,
  isLastPit,
  oppositeIndex,
  nextPosition,
  sidePositions,
  pitIndex,
} from "./pos";

/** Create the initial game state */
export function createInitialState(): GameState {
  return {
    board: initialBoard(),
    score: { south: 0, north: 0 },
    currentSide: "south",
    moveNumber: 1,
    tuzdikSouth: null,
    tuzdikNorth: null,
    isGameOver: false,
    winner: null,
  };
}

/** Get the opposite side */
export function oppositeSide(side: Side): Side {
  return side === "south" ? "north" : "south";
}

/** Get valid moves for current side */
export function validMoves(state: GameState): readonly number[] {
  if (state.isGameOver) return [];
  const positions = sidePositions(state.currentSide);
  return positions.filter((i) => stonesAt(state.board, i) > 0);
}

/** Execute a move from a pit index. Returns new state or error. */
export function executeMove(
  state: GameState,
  fromIndex: number
): MoveResult {
  // Validate
  if (state.isGameOver) {
    return { state, captured: 0, tuzdikCreated: false, error: "Game is over" };
  }

  const side = state.currentSide;
  if (positionSide(fromIndex) !== side) {
    return { state, captured: 0, tuzdikCreated: false, error: "Cannot move from opponent's pit" };
  }

  const stoneCount = stonesAt(state.board, fromIndex);
  if (stoneCount === 0) {
    return { state, captured: 0, tuzdikCreated: false, error: "Pit is empty" };
  }

  // Sow stones
  const { board: boardAfterSow, lastPos } = sowStones(
    state.board,
    fromIndex,
    stoneCount
  );

  // Check captures and tuzdyk
  const {
    board: boardAfterCapture,
    captured,
    tuzdikCreated,
    newTuzdikSouth,
    newTuzdikNorth,
  } = processCaptures(
    boardAfterSow,
    lastPos,
    side,
    state.tuzdikSouth,
    state.tuzdikNorth
  );

  // Collect tuzdyk stones (stones that land on a tuzdyk are captured)
  const boardAfterTuzdyk = collectTuzdykStones(
    boardAfterCapture,
    newTuzdikSouth ?? state.tuzdikSouth,
    newTuzdikNorth ?? state.tuzdikNorth
  );

  // Calculate new scores
  const tuzdykCapture = calculateTuzdykCapture(
    boardAfterCapture,
    boardAfterTuzdyk
  );
  const newScore: Score = {
    south: state.score.south + (side === "south" ? captured : 0) + tuzdykCapture.south,
    north: state.score.north + (side === "north" ? captured : 0) + tuzdykCapture.north,
  };

  // Check game end
  const nextSide = oppositeSide(side);
  const nextMoveNum = side === "north" ? state.moveNumber + 1 : state.moveNumber;
  const gameEnd = checkGameEnd(boardAfterTuzdyk, newScore, nextSide);

  const newState: GameState = {
    board: boardAfterTuzdyk,
    score: newScore,
    currentSide: gameEnd.isOver ? side : nextSide,
    moveNumber: nextMoveNum,
    tuzdikSouth: newTuzdikSouth ?? state.tuzdikSouth,
    tuzdikNorth: newTuzdikNorth ?? state.tuzdikNorth,
    isGameOver: gameEnd.isOver,
    winner: gameEnd.winner,
  };

  return { state: newState, captured, tuzdikCreated, error: null };
}

/** Sow stones from a pit */
function sowStones(
  board: PieceMap,
  fromIndex: number,
  count: number
): { board: PieceMap; lastPos: number } {
  let b = emptyPit(board, fromIndex);
  let pos = fromIndex;

  if (count === 1) {
    // Single stone: move to next pit
    pos = nextPosition(fromIndex);
    b = addStones(b, pos, 1);
  } else {
    // Multiple stones: first stays, rest distribute forward
    b = addStones(b, fromIndex, 1);
    for (let i = 1; i < count; i++) {
      pos = nextPosition(pos);
      b = addStones(b, pos, 1);
    }
  }

  return { board: b, lastPos: pos };
}

/** Process captures after sowing */
function processCaptures(
  board: PieceMap,
  lastPos: number,
  movingSide: Side,
  tuzdikSouth: number | null,
  tuzdikNorth: number | null
): {
  board: PieceMap;
  captured: number;
  tuzdikCreated: boolean;
  newTuzdikSouth: number | null;
  newTuzdikNorth: number | null;
} {
  const landedOnOpponentSide = positionSide(lastPos) !== movingSide;
  const stonesInLastPit = stonesAt(board, lastPos);
  let captured = 0;
  let tuzdikCreated = false;
  let newTuzdikSouth: number | null = null;
  let newTuzdikNorth: number | null = null;

  if (!landedOnOpponentSide) {
    return { board, captured, tuzdikCreated, newTuzdikSouth, newTuzdikNorth };
  }

  // Check for even capture (stones in opponent's pit are even → capture all)
  if (stonesInLastPit % 2 === 0) {
    captured = stonesInLastPit;
    board = emptyPit(board, lastPos);
  }
  // Check for tuzdyk creation (exactly 3 stones)
  else if (stonesInLastPit === 3) {
    const canCreateTuzdik = checkTuzdykConditions(
      lastPos,
      movingSide,
      tuzdikSouth,
      tuzdikNorth
    );
    if (canCreateTuzdik) {
      // Mark as tuzdyk — belongs to the moving side
      const pitSide = positionSide(lastPos);
      board = new Map(board);
      (board as Map<number, PitState>).set(lastPos, {
        piece: createTuzdik(movingSide),
        count: stonesInLastPit,
      });
      captured = stonesInLastPit;
      board = emptyPit(board, lastPos);
      tuzdikCreated = true;

      if (movingSide === "south") {
        newTuzdikSouth = lastPos;
      } else {
        newTuzdikNorth = lastPos;
      }
    }
  }

  return { board, captured, tuzdikCreated, newTuzdikSouth, newTuzdikNorth };
}

/** Check if tuzdyk can be created at a position */
function checkTuzdykConditions(
  pos: number,
  movingSide: Side,
  tuzdikSouth: number | null,
  tuzdikNorth: number | null
): boolean {
  // Condition 1: Moving side doesn't already have a tuzdyk
  if (movingSide === "south" && tuzdikSouth !== null) return false;
  if (movingSide === "north" && tuzdikNorth !== null) return false;

  // Condition 2: Not the last pit on opponent's side
  if (isLastPit(pos)) return false;

  // Condition 3: Opponent's tuzdyk is not directly opposite
  const opposite = oppositeIndex(pos);
  if (movingSide === "south" && tuzdikNorth === opposite) return false;
  if (movingSide === "north" && tuzdikSouth === opposite) return false;

  return true;
}

/** Collect stones from tuzdyk positions (ongoing capture) */
function collectTuzdykStones(
  board: PieceMap,
  tuzdikSouth: number | null,
  tuzdikNorth: number | null
): PieceMap {
  let b = board;

  if (tuzdikSouth !== null) {
    const stones = stonesAt(b, tuzdikSouth);
    if (stones > 0) {
      b = emptyPit(b, tuzdikSouth);
    }
  }

  if (tuzdikNorth !== null) {
    const stones = stonesAt(b, tuzdikNorth);
    if (stones > 0) {
      b = emptyPit(b, tuzdikNorth);
    }
  }

  return b;
}

/** Calculate stones captured by tuzdyk collection */
function calculateTuzdykCapture(
  before: PieceMap,
  after: PieceMap
): { south: number; north: number } {
  let south = 0;
  let north = 0;

  for (const [index] of before) {
    const beforeCount = stonesAt(before, index);
    const afterCount = stonesAt(after, index);
    if (afterCount < beforeCount) {
      const diff = beforeCount - afterCount;
      // If pit is on north's side and was emptied, south captured
      if (positionSide(index) === "north") south += diff;
      else north += diff;
    }
  }

  return { south, north };
}

/** Check if game is over */
function checkGameEnd(
  board: PieceMap,
  score: Score,
  nextSide: Side
): { isOver: boolean; winner: Side | "draw" | null } {
  // Win by score
  if (score.south >= WIN_SCORE) {
    return { isOver: true, winner: "south" };
  }
  if (score.north >= WIN_SCORE) {
    return { isOver: true, winner: "north" };
  }

  // Draw
  if (score.south === DRAW_SCORE && score.north === DRAW_SCORE) {
    return { isOver: true, winner: "draw" };
  }

  // No valid moves for next player
  const nextMoves = sidePositions(nextSide).filter(
    (i) => stonesAt(board, i) > 0
  );
  if (nextMoves.length === 0) {
    // Remaining stones go to the side that has them
    if (score.south > score.north) return { isOver: true, winner: "south" };
    if (score.north > score.south) return { isOver: true, winner: "north" };
    return { isOver: true, winner: "draw" };
  }

  return { isOver: false, winner: null };
}

/** Execute a move by pit number (1-9) for current side */
export function executeMoveByPit(
  state: GameState,
  pit: number
): MoveResult {
  const index = pitIndex(state.currentSide, pit);
  return executeMove(state, index);
}
