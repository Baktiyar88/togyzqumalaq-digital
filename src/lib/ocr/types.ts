export interface ParsedMove {
  moveNumber: number;
  side: "white" | "black";
  fromPit: number;
  notation?: string;
}

export interface OcrResult {
  moves: ParsedMove[];
  confidence: number;
  rawText: string;
  processingTimeMs: number;
}

export interface OcrError {
  message: string;
  code: string;
}
