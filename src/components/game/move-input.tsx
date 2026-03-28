"use client";

import { Group, NumberInput, Button, Text, Badge } from "@mantine/core";
import { IconPlayerPlay } from "@tabler/icons-react";
import { useState } from "react";
import type { Side } from "@/lib/game-engine/types";

interface MoveInputProps {
  currentSide: Side;
  moveNumber: number;
  isGameOver: boolean;
  validPits: readonly number[];
  onMove: (pit: number) => void;
}

export function MoveInput({ currentSide, moveNumber, isGameOver, validPits, onMove }: MoveInputProps) {
  const [pit, setPit] = useState<number | "">(1);

  function handleSubmit() {
    if (typeof pit === "number" && validPits.includes(pit)) {
      onMove(pit);
      setPit(1);
    }
  }

  if (isGameOver) return null;

  return (
    <Group gap="md" align="end">
      <Text size="sm" c="dimmed">Move {moveNumber}:</Text>
      <Badge color={currentSide === "south" ? "blue" : "orange"} size="lg">
        {currentSide === "south" ? "South" : "North"}
      </Badge>
      <NumberInput
        label="Pit"
        min={1}
        max={9}
        value={pit}
        onChange={(v) => setPit(typeof v === "number" ? v : 1)}
        size="sm"
        w={80}
      />
      <Button
        onClick={handleSubmit}
        disabled={typeof pit !== "number" || !validPits.includes(pit)}
        leftSection={<IconPlayerPlay size={16} />}
        size="sm"
      >
        Move
      </Button>
      <Text size="xs" c="dimmed">
        Valid: {validPits.join(", ")}
      </Text>
    </Group>
  );
}
