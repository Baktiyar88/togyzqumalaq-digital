"use client";

import { Card, Group, Stack, Text, Badge } from "@mantine/core";
import { Pit } from "./pit";
import type { GameState } from "@/lib/game-engine/types";
import { stonesAt } from "@/lib/game-engine/board";
import { validMoves } from "@/lib/game-engine/engine";

interface BoardProps {
  state: GameState;
  onPitClick?: (index: number) => void;
}

export function Board({ state, onPitClick }: BoardProps) {
  const validIndices = new Set(validMoves(state));

  // North pits: 17(A2) 16(B2) 15(C2) 14(D2) 13(E2) 12(F2) 11(G2) 10(H2) 9(I2)
  // South pits: 0(A1) 1(B1) 2(C1) 3(D1) 4(E1) 5(F1) 6(G1) 7(H1) 8(I1)
  const northIndices = [17, 16, 15, 14, 13, 12, 11, 10, 9];
  const southIndices = [0, 1, 2, 3, 4, 5, 6, 7, 8];

  return (
    <Card padding="lg" radius="lg" withBorder style={{ background: "var(--mantine-color-dark-7)" }}>
      <Stack gap="md">
        {/* North label + score */}
        <Group justify="space-between">
          <Badge color={state.currentSide === "north" ? "indigo" : "dark"} size="lg" variant="light">
            North {state.currentSide === "north" ? "(to move)" : ""}
          </Badge>
          <Text size="xl" fw={700} c="indigo">
            {state.score.north}
          </Text>
        </Group>

        {/* North pits */}
        <Group gap="xs" justify="center">
          {northIndices.map((idx, i) => (
            <Pit
              key={idx}
              index={idx}
              stones={stonesAt(state.board, idx)}
              isTuzdik={state.tuzdikSouth === idx}
              isPlayable={validIndices.has(idx)}
              isHighlighted={false}
              side="north"
              pitNumber={9 - i}
              onClick={() => onPitClick?.(idx)}
            />
          ))}
        </Group>

        {/* Divider with kazan labels */}
        <Group justify="center" gap="xl">
          <Text size="sm" c="dimmed">Kazans: South {state.score.south} — North {state.score.north}</Text>
        </Group>

        {/* South pits */}
        <Group gap="xs" justify="center">
          {southIndices.map((idx) => (
            <Pit
              key={idx}
              index={idx}
              stones={stonesAt(state.board, idx)}
              isTuzdik={state.tuzdikNorth === idx}
              isPlayable={validIndices.has(idx)}
              isHighlighted={false}
              side="south"
              pitNumber={idx + 1}
              onClick={() => onPitClick?.(idx)}
            />
          ))}
        </Group>

        {/* South label + score */}
        <Group justify="space-between">
          <Badge color={state.currentSide === "south" ? "indigo" : "dark"} size="lg" variant="light">
            South {state.currentSide === "south" ? "(to move)" : ""}
          </Badge>
          <Text size="xl" fw={700} c="indigo">
            {state.score.south}
          </Text>
        </Group>

        {/* Game over */}
        {state.isGameOver && (
          <Badge color="green" size="xl" fullWidth variant="filled">
            {state.winner === "draw" ? "Draw!" : `${state.winner === "south" ? "South" : "North"} wins!`}
          </Badge>
        )}
      </Stack>
    </Card>
  );
}
