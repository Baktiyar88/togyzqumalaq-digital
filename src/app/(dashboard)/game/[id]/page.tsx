"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Container, Title, Grid, Stack, Loader, Center, Alert } from "@mantine/core";
import { IconAlertTriangle } from "@tabler/icons-react";
import { useParams } from "next/navigation";
import { Board } from "@/components/board/board";
import { BoardControls } from "@/components/board/board-controls";
import { MoveList } from "@/components/game/move-list";
import { FenDisplay } from "@/components/game/fen-display";
import { getGame } from "@/actions/games";
import { createInitialState, executeMoveByPit } from "@/lib/game-engine/engine";
import { toFen } from "@/lib/game-engine/fen";
import type { GameState } from "@/lib/game-engine/types";
import type { GameMove } from "@/lib/supabase/types";

interface ReplayState {
  states: GameState[];
  fenList: string[];
  moveEntries: Array<{ moveNumber: number; side: "south" | "north"; pit: number; captured: number; tuzdik: boolean }>;
}

function buildReplay(moves: GameMove[]): ReplayState {
  const initial = createInitialState();
  const states: GameState[] = [initial];
  const fenList: string[] = [toFen(initial)];
  const moveEntries: ReplayState["moveEntries"] = [];

  let current = initial;
  for (const m of moves) {
    const side = m.side === "white" ? "south" : "north";
    if (current.currentSide !== side) continue;

    const result = executeMoveByPit(current, m.from_pit);
    if (result.error) continue;

    current = result.state;
    states.push(current);
    fenList.push(toFen(current));
    moveEntries.push({
      moveNumber: m.move_number,
      side,
      pit: m.from_pit,
      captured: result.captured,
      tuzdik: result.tuzdikCreated,
    });
  }

  return { states, fenList, moveEntries };
}

export default function GameReplayPage() {
  const params = useParams();
  const gameId = params.id as string;

  const [replay, setReplay] = useState<ReplayState | null>(null);
  const replayRef = useRef<ReplayState | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const result = await getGame(gameId);
      if ("error" in result) {
        setError(result.error as string);
        setLoading(false);
        return;
      }
      const r = buildReplay(result.moves as GameMove[]);
      replayRef.current = r;
      setReplay(r);
      setLoading(false);
    }
    load();
  }, [gameId]);

  const goFirst = useCallback(() => setCurrentIndex(0), []);
  const goPrev = useCallback(() => setCurrentIndex((i) => Math.max(0, i - 1)), []);
  const goNext = useCallback(() => {
    const r = replayRef.current;
    if (!r) return;
    setCurrentIndex((i) => Math.min(r.states.length - 1, i + 1));
  }, []);
  const goLast = useCallback(() => {
    const r = replayRef.current;
    if (!r) return;
    setCurrentIndex(r.states.length - 1);
  }, []);

  if (loading) {
    return (
      <Center h={400}><Loader size="lg" /></Center>
    );
  }

  if (error) {
    return (
      <Container size="md" py="xl">
        <Alert icon={<IconAlertTriangle size={16} />} color="red" title="Error">
          {error}
        </Alert>
      </Container>
    );
  }

  if (!replay) return null;

  const currentState = replay.states[currentIndex];

  return (
    <Container size="lg" py="xl">
      <Title order={2} mb="xl">Game Replay</Title>

      <Grid gutter="xl">
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Stack gap="lg">
            <Board state={currentState} />
            <BoardControls
              currentIndex={currentIndex}
              totalMoves={replay.states.length - 1}
              onFirst={goFirst}
              onPrev={goPrev}
              onNext={goNext}
              onLast={goLast}
            />
            <FenDisplay fen={replay.fenList[currentIndex]} label="Current Position (FEN)" />
          </Stack>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 4 }}>
          <Stack gap="lg">
            <MoveList
              moves={replay.moveEntries}
              currentMoveIndex={currentIndex > 0 ? currentIndex - 1 : undefined}
            />
            <FenDisplay fen={replay.fenList.join("\n")} label="Full Game FEN" />
          </Stack>
        </Grid.Col>
      </Grid>
    </Container>
  );
}
