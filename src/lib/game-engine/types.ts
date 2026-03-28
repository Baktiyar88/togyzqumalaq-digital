/** Side (player) in the game */
export type Side = "south" | "north";

/** Piece role */
export type PieceRole = "stone" | "tuzdik";

/** A piece on the board */
export interface Piece {
  readonly side: Side;
  readonly role: PieceRole;
}

/** A single pit with piece info and stone count */
export interface PitState {
  readonly piece: Piece;
  readonly count: number;
}

/** Board state: map of position index to pit state */
export type PieceMap = ReadonlyMap<number, PitState>;

/** A parsed move */
export interface Move {
  readonly moveNumber: number;
  readonly side: Side;
  readonly fromPit: number; // 1-9 (human-readable)
  readonly fromIndex: number; // 0-17 (internal)
}

/** Score for both players */
export interface Score {
  readonly south: number;
  readonly north: number;
}

/** Complete game state */
export interface GameState {
  readonly board: PieceMap;
  readonly score: Score;
  readonly currentSide: Side;
  readonly moveNumber: number;
  readonly tuzdikSouth: number | null; // index of south's tuzdik on north's side
  readonly tuzdikNorth: number | null; // index of north's tuzdik on south's side
  readonly isGameOver: boolean;
  readonly winner: Side | "draw" | null;
}

/** FEN string components */
export interface FenComponents {
  readonly pitsSouth: readonly number[]; // 9 values
  readonly pitsNorth: readonly number[]; // 9 values
  readonly scoreSouth: number;
  readonly scoreNorth: number;
  readonly side: Side;
  readonly moveNumber: number;
  readonly tuzdikSouth: number | null; // pit index on north side (0-8)
  readonly tuzdikNorth: number | null; // pit index on south side (0-8)
}

/** Result of executing a move */
export interface MoveResult {
  readonly state: GameState;
  readonly captured: number; // stones captured this move
  readonly tuzdikCreated: boolean;
  readonly error: string | null;
}

/** Board dimensions */
export const BOARD_WIDTH = 9;
export const BOARD_SIZE = 18; // 9 pits per side
export const TOTAL_STONES = 162; // 9 * 18
export const INITIAL_STONES_PER_PIT = 9;
export const WIN_SCORE = 82; // > half of 162
export const DRAW_SCORE = 81;
