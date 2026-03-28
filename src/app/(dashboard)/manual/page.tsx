"use client";

import { useState, useCallback } from "react";
import { Container, Title, Grid, Stack } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { Board } from "@/components/board/board";
import { MoveInput } from "@/components/game/move-input";
import { MoveList } from "@/components/game/move-list";
import { FenDisplay } from "@/components/game/fen-display";
import { createInitialState, executeMove, validMoves } from "@/lib/game-engine/engine";
import { toFen } from "@/lib/game-engine/fen";
import { positionSide, pitNumber } from "@/lib/game-engine/pos";
import type { GameState } from "@/lib/game-engine/types";

interface MoveEntry {
  moveNumber: number;
  side: "south" | "north";
  pit: number;
  captured: number;
  tuzdik: boolean;
}

export default function ManualEntryPage() {
  const [state, setState] = useState<GameState>(createInitialState());
  const [moveHistory, setMoveHistory] = useState<MoveEntry[]>([]);
  const [fenHistory, setFenHistory] = useState<string[]>([toFen(createInitialState())]);

  const validPitNumbers = validMoves(state).map((idx) => {
    if (state.currentSide === "south") return idx + 1;
    return 18 - idx;
  });

  const handlePitClick = useCallback((index: number) => {
    if (positionSide(index) !== state.currentSide) return;

    const result = executeMove(state, index);
    if (result.error) {
      notifications.show({ title: "Invalid move", message: result.error, color: "red" });
      return;
    }

    const entry: MoveEntry = {
      moveNumber: state.moveNumber,
      side: state.currentSide,
      pit: pitNumber(index),
      captured: result.captured,
      tuzdik: result.tuzdikCreated,
    };

    setState(result.state);
    setMoveHistory((prev) => [...prev, entry]);
    setFenHistory((prev) => [...prev, toFen(result.state)]);

    if (result.state.isGameOver) {
      const winner = result.state.winner;
      notifications.show({
        title: "Game Over!",
        message: winner === "draw" ? "Draw!" : `${winner === "south" ? "South" : "North"} wins!`,
        color: "green",
      });
    }
  }, [state]);

  const handleMove = useCallback((pit: number) => {
    const index = state.currentSide === "south" ? pit - 1 : 18 - pit;
    handlePitClick(index);
  }, [state, handlePitClick]);

  return (
    <Container size="lg" py="xl">
      <Title order={2} mb="xl">Manual Entry</Title>

      <Grid gutter="xl">
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Stack gap="lg">
            <Board state={state} onPitClick={handlePitClick} />
            <MoveInput
              currentSide={state.currentSide}
              moveNumber={state.moveNumber}
              isGameOver={state.isGameOver}
              validPits={validPitNumbers}
              onMove={handleMove}
            />
            <FenDisplay fen={toFen(state)} label="Current Position (FEN)" />
          </Stack>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 4 }}>
          <Stack gap="lg">
            <MoveList moves={moveHistory} currentMoveIndex={moveHistory.length - 1} />
            {fenHistory.length > 1 && (
              <FenDisplay fen={fenHistory.join("\n")} label="Full Game FEN" />
            )}
          </Stack>
        </Grid.Col>
      </Grid>
    </Container>
  );
}
