import { z } from "zod";

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "application/pdf"];

export const uploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine((f) => f.size <= MAX_FILE_SIZE, "File must be under 20MB")
    .refine((f) => ACCEPTED_TYPES.includes(f.type), "Only JPEG, PNG, PDF accepted"),
});

export const ocrRequestSchema = z.object({
  fileUrl: z.string().url(),
  model: z.string().default("deepseek-ocr"),
});

export const parsedMoveSchema = z.object({
  moveNumber: z.number().int().min(1),
  side: z.enum(["white", "black"]),
  fromPit: z.number().int().min(1).max(9),
  notation: z.string().optional(),
});

export const ocrResultSchema = z.object({
  moves: z.array(parsedMoveSchema),
  confidence: z.number().min(0).max(1).optional(),
  rawText: z.string().optional(),
});

export type UploadInput = z.infer<typeof uploadSchema>;
export type OcrRequestInput = z.infer<typeof ocrRequestSchema>;
export type ParsedMoveInput = z.infer<typeof parsedMoveSchema>;
