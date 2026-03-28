"use client";

import { Card, Group, Stack, Text, Badge, Box, Divider } from "@mantine/core";
import { motion, AnimatePresence } from "motion/react";
import { Pit } from "./pit";
import type { GameState } from "@/lib/game-engine/types";
import { stonesAt } from "@/lib/game-engine/board";
import { validMoves } from "@/lib/game-engine/engine";

interface BoardProps {
  state: GameState;
  onPitClick?: (index: number) => void;
}

function AnimatedScore({ value, label }: { value: number; label: string }) {
  return (
    <motion.div
      key={value}
      initial={{ scale: 1.3, color: "var(--mantine-color-indigo-4)" }}
      animate={{ scale: 1, color: "var(--mantine-color-indigo-6)" }}
      transition={{ type: "spring", stiffness: 300, damping: 15 }}
    >
      <Text size="xl" fw={800} c="indigo" ta="center" aria-label={`${label} score: ${value}`}>
        {value}
      </Text>
    </motion.div>
  );
}

export function Board({ state, onPitClick }: BoardProps) {
  const validIndices = new Set(validMoves(state));
  const northIndices = [17, 16, 15, 14, 13, 12, 11, 10, 9];
  const southIndices = [0, 1, 2, 3, 4, 5, 6, 7, 8];

  return (
    <Card
      padding="lg"
      radius="xl"
      withBorder
      aria-label="Togyzqumalaq game board"
      style={{
        background: "linear-gradient(180deg, var(--mantine-color-dark-8) 0%, var(--mantine-color-dark-7) 50%, var(--mantine-color-dark-8) 100%)",
        backgroundImage: "url(/board/togyzkumalak_wood_board_mini.png)",
        backgroundSize: "cover",
        backgroundBlendMode: "overlay",
        border: "2px solid var(--mantine-color-dark-4)",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Subtle inner glow */}
      <Box
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse at 50% 50%, rgba(99,102,241,0.05) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <Stack gap="md" style={{ position: "relative" }}>
        {/* North side */}
        <Group justify="space-between" align="center">
          <motion.div
            animate={{
              boxShadow: state.currentSide === "north"
                ? "0 0 20px rgba(99,102,241,0.4)"
                : "none",
            }}
            style={{ borderRadius: 20 }}
          >
            <Badge
              color={state.currentSide === "north" ? "indigo" : "dark"}
              size="lg"
              variant={state.currentSide === "north" ? "filled" : "light"}
              radius="xl"
            >
              {state.currentSide === "north" ? "▶ North" : "North"}
            </Badge>
          </motion.div>
          <AnimatedScore value={state.score.north} label="North" />
        </Group>

        {/* North pits */}
        <Group gap={4} justify="center" wrap="nowrap" style={{ overflowX: "auto" }}>
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

        {/* Center divider — kazans */}
        <Divider
          label={
            <Text size="sm" fw={600} c="dimmed">
              ☰ Kazan: {state.score.south} — {state.score.north} ☰
            </Text>
          }
          labelPosition="center"
          color="dark.4"
        />

        {/* South pits */}
        <Group gap={4} justify="center" wrap="nowrap" style={{ overflowX: "auto" }}>
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

        {/* South side */}
        <Group justify="space-between" align="center">
          <motion.div
            animate={{
              boxShadow: state.currentSide === "south"
                ? "0 0 20px rgba(99,102,241,0.4)"
                : "none",
            }}
            style={{ borderRadius: 20 }}
          >
            <Badge
              color={state.currentSide === "south" ? "indigo" : "dark"}
              size="lg"
              variant={state.currentSide === "south" ? "filled" : "light"}
              radius="xl"
            >
              {state.currentSide === "south" ? "▶ South" : "South"}
            </Badge>
          </motion.div>
          <AnimatedScore value={state.score.south} label="South" />
        </Group>

        {/* Game over overlay */}
        <AnimatePresence>
          {state.isGameOver && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
            >
              <Badge
                color="green"
                size="xl"
                fullWidth
                variant="filled"
                radius="lg"
                style={{ padding: "12px 0", fontSize: 18 }}
              >
                {state.winner === "draw" ? "🤝 Draw!" : `🏆 ${state.winner === "south" ? "South" : "North"} wins!`}
              </Badge>
            </motion.div>
          )}
        </AnimatePresence>
      </Stack>
    </Card>
  );
}
