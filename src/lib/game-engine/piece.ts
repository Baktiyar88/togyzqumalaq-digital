import type { Piece, PieceRole, Side } from "./types";

export function createStone(side: Side): Piece {
  return { side, role: "stone" };
}

export function createTuzdik(side: Side): Piece {
  return { side, role: "tuzdik" };
}

export function isStone(piece: Piece): boolean {
  return piece.role === "stone";
}

export function isTuzdik(piece: Piece): boolean {
  return piece.role === "tuzdik";
}

/** FEN character for a piece role */
export function roleForsyth(role: PieceRole): string {
  return role === "stone" ? "S" : "t";
}

/** Parse FEN character to role */
export function roleFromForsyth(char: string): PieceRole {
  return char.toLowerCase() === "t" ? "tuzdik" : "stone";
}
