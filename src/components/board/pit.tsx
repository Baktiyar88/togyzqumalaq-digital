"use client";

import { Text, UnstyledButton } from "@mantine/core";
import { motion } from "motion/react";

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
    <motion.div
      whileHover={isPlayable ? { scale: 1.1, y: -4 } : {}}
      whileTap={isPlayable ? { scale: 0.95 } : {}}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
    >
      <UnstyledButton
        onClick={isPlayable ? onClick : undefined}
        style={{
          width: "clamp(36px, 9vw, 64px)",
          height: "clamp(44px, 11vw, 76px)",
          borderRadius: isTuzdik ? 16 : 12,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
          cursor: isPlayable ? "pointer" : "default",
          background: isTuzdik
            ? "linear-gradient(135deg, var(--mantine-color-red-9), var(--mantine-color-red-7))"
            : isHighlighted
              ? "linear-gradient(135deg, var(--mantine-color-indigo-9), var(--mantine-color-indigo-7))"
              : isPlayable
                ? "linear-gradient(135deg, var(--mantine-color-dark-5), var(--mantine-color-dark-6))"
                : "var(--mantine-color-dark-6)",
          border: isPlayable
            ? "2px solid var(--mantine-color-indigo-5)"
            : "1px solid var(--mantine-color-dark-4)",
          boxShadow: isPlayable
            ? "0 0 12px rgba(99, 102, 241, 0.15)"
            : isTuzdik
              ? "0 0 16px rgba(239, 68, 68, 0.3)"
              : "none",
          transition: "box-shadow 200ms ease, border-color 200ms ease",
        }}
        aria-label={`Pit ${pitNumber} ${side}: ${stones} stones${isTuzdik ? " (tuzdik)" : ""}`}
      >
        <Text size="xs" c="dimmed" fw={500} style={{ fontSize: "clamp(9px, 2vw, 12px)" }}>
          {pitNumber}
        </Text>
        <Text fw={700} c={stones === 0 ? "dimmed" : "white"} style={{ fontSize: "clamp(14px, 3.5vw, 20px)" }}>
          {stones}
        </Text>
        {isTuzdik && (
          <Text size="xs" c="red.3" fw={700} style={{ fontSize: "clamp(8px, 1.5vw, 11px)" }}>
            T
          </Text>
        )}
      </UnstyledButton>
    </motion.div>
  );
}
