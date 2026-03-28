"use client";

import { Box, Text, UnstyledButton } from "@mantine/core";

interface PitProps {
  index: number;
  stones: number;
  isTuzdik: boolean;
  isPlayable: boolean;
  isHighlighted: boolean;
  side: "south" | "north";
  pitNumber: number;
  onClick?: () => void;
}

export function Pit({
  stones,
  isTuzdik,
  isPlayable,
  isHighlighted,
  side,
  pitNumber,
  onClick,
}: PitProps) {
  return (
    <UnstyledButton
      onClick={isPlayable ? onClick : undefined}
      style={{
        width: 64,
        height: 72,
        borderRadius: 12,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
        cursor: isPlayable ? "pointer" : "default",
        background: isTuzdik
          ? "var(--mantine-color-red-9)"
          : isHighlighted
            ? "var(--mantine-color-indigo-9)"
            : "var(--mantine-color-dark-6)",
        border: isPlayable
          ? "2px solid var(--mantine-color-indigo-5)"
          : "1px solid var(--mantine-color-dark-4)",
        transition: "all 150ms ease",
        transform: isPlayable ? undefined : "none",
      }}
      aria-label={`Pit ${pitNumber} ${side}: ${stones} stones${isTuzdik ? " (tuzdik)" : ""}`}
    >
      <Text size="xs" c="dimmed" fw={500}>
        {pitNumber}
      </Text>
      <Text size="lg" fw={700} c={stones === 0 ? "dimmed" : "white"}>
        {stones}
      </Text>
      {isTuzdik && (
        <Text size="xs" c="red.3" fw={600}>
          T
        </Text>
      )}
    </UnstyledButton>
  );
}
