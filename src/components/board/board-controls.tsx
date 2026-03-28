"use client";

import { Group, ActionIcon, Tooltip, Text } from "@mantine/core";
import {
  IconPlayerSkipBack,
  IconPlayerTrackPrev,
  IconPlayerTrackNext,
  IconPlayerSkipForward,
  IconPlayerPlay,
  IconPlayerPause,
} from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";

interface BoardControlsProps {
  currentIndex: number;
  totalMoves: number;
  onFirst: () => void;
  onPrev: () => void;
  onNext: () => void;
  onLast: () => void;
}

export function BoardControls({
  currentIndex,
  totalMoves,
  onFirst,
  onPrev,
  onNext,
  onLast,
}: BoardControlsProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        onNext();
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, onNext]);

  useEffect(() => {
    if (currentIndex >= totalMoves) setIsPlaying(false);
  }, [currentIndex, totalMoves]);

  return (
    <Group justify="center" gap="xs">
      <Tooltip label="First">
        <ActionIcon variant="subtle" size="lg" onClick={onFirst} disabled={currentIndex <= 0}>
          <IconPlayerSkipBack size={18} />
        </ActionIcon>
      </Tooltip>
      <Tooltip label="Previous">
        <ActionIcon variant="subtle" size="lg" onClick={onPrev} disabled={currentIndex <= 0}>
          <IconPlayerTrackPrev size={18} />
        </ActionIcon>
      </Tooltip>

      <Tooltip label={isPlaying ? "Pause" : "Auto-play"}>
        <ActionIcon
          variant="light"
          size="lg"
          color={isPlaying ? "yellow" : "indigo"}
          onClick={() => setIsPlaying((p) => !p)}
          disabled={currentIndex >= totalMoves}
        >
          {isPlaying ? <IconPlayerPause size={18} /> : <IconPlayerPlay size={18} />}
        </ActionIcon>
      </Tooltip>

      <Tooltip label="Next">
        <ActionIcon variant="subtle" size="lg" onClick={onNext} disabled={currentIndex >= totalMoves}>
          <IconPlayerTrackNext size={18} />
        </ActionIcon>
      </Tooltip>
      <Tooltip label="Last">
        <ActionIcon variant="subtle" size="lg" onClick={onLast} disabled={currentIndex >= totalMoves}>
          <IconPlayerSkipForward size={18} />
        </ActionIcon>
      </Tooltip>

      <Text size="sm" c="dimmed" ml="sm">
        {currentIndex} / {totalMoves}
      </Text>
    </Group>
  );
}
