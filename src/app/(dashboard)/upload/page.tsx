"use client";

import { useState } from "react";
import { Container, Title, Stack, Stepper, Alert } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconUpload, IconScan, IconCheck, IconAlertTriangle } from "@tabler/icons-react";
import { UploadZone } from "@/components/ocr/upload-zone";
import { OcrProgress } from "@/components/ocr/ocr-progress";
import { OcrResults } from "@/components/ocr/ocr-results";
import { FenDisplay } from "@/components/game/fen-display";
import { uploadScoresheet } from "@/actions/upload";
import { triggerOCR } from "@/actions/ocr";
import { createGame, saveMoves } from "@/actions/games";
import { createInitialState, executeMoveByPit } from "@/lib/game-engine/engine";
import { toFen } from "@/lib/game-engine/fen";
import type { ParsedMove } from "@/lib/ocr/types";

type Step = "upload" | "processing" | "review" | "done";

export default function UploadPage() {
  const [step, setStep] = useState<Step>("upload");
  const [progress, setProgress] = useState(0);
  const [moves, setMoves] = useState<ParsedMove[]>([]);
  const [confidence, setConfidence] = useState(0);
  const [fenResult, setFenResult] = useState("");
  const [error, setError] = useState<string | null>(null);

  const activeStep = step === "upload" ? 0 : step === "processing" ? 1 : step === "review" ? 2 : 3;

  async function handleUpload(files: File[]) {
    const file = files[0];
    if (!file) return;

    setStep("processing");
    setProgress(10);
    setError(null);

    try {
      // Upload file
      const formData = new FormData();
      formData.append("file", file);
      const uploadResult = await uploadScoresheet(formData);
      if ("error" in uploadResult) throw new Error(uploadResult.error);

      setProgress(40);

      // Run OCR
      const ocrResult = await triggerOCR(uploadResult.fileUrl);
      if ("error" in ocrResult) throw new Error(ocrResult.error);

      setProgress(100);
      setMoves(ocrResult.moves);
      setConfidence(ocrResult.confidence);
      setStep("review");

      notifications.show({ title: "OCR Complete", message: `${ocrResult.moves.length} moves recognized`, color: "green" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      setError(msg);
      setStep("upload");
      notifications.show({ title: "Error", message: msg, color: "red" });
    }
  }

  async function handleConfirm(confirmedMoves: ParsedMove[]) {
    try {
      // Generate FEN sequence
      let state = createInitialState();
      const fenLines: string[] = [toFen(state)];

      for (const move of confirmedMoves) {
        const side = move.side === "white" ? "south" : "north";
        if (state.currentSide !== side) continue;

        const result = executeMoveByPit(state, move.fromPit);
        if (result.error) continue;

        state = result.state;
        fenLines.push(toFen(state));
      }

      setFenResult(fenLines.join("\n"));
      setStep("done");

      notifications.show({ title: "FEN Generated", message: `${fenLines.length} positions`, color: "green" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to generate FEN";
      notifications.show({ title: "Error", message: msg, color: "red" });
    }
  }

  return (
    <Container size="md" py="xl">
      <Stack gap="xl">
        <Title order={2}>Upload Scoresheet</Title>

        <Stepper active={activeStep} size="sm">
          <Stepper.Step label="Upload" icon={<IconUpload size={16} />} />
          <Stepper.Step label="OCR" icon={<IconScan size={16} />} />
          <Stepper.Step label="Review" icon={<IconCheck size={16} />} />
          <Stepper.Completed>FEN Generated</Stepper.Completed>
        </Stepper>

        {error && (
          <Alert icon={<IconAlertTriangle size={16} />} color="red" title="Error">
            {error}
          </Alert>
        )}

        {step === "upload" && <UploadZone onDrop={handleUpload} />}

        {step === "processing" && (
          <OcrProgress progress={progress} status="processing" />
        )}

        {step === "review" && (
          <OcrResults moves={moves} confidence={confidence} onConfirm={handleConfirm} />
        )}

        {step === "done" && <FenDisplay fen={fenResult} label="Game FEN Sequence" />}
      </Stack>
    </Container>
  );
}
