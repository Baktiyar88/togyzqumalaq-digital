"use client";

import { Progress, Text, Stack, Badge, Group } from "@mantine/core";
import { IconScan } from "@tabler/icons-react";

interface OcrProgressProps {
  progress: number;
  status: "pending" | "processing" | "completed" | "failed";
}

const statusColors = {
  pending: "gray",
  processing: "blue",
  completed: "green",
  failed: "red",
} as const;

const statusLabels = {
  pending: "Waiting...",
  processing: "Recognizing moves...",
  completed: "Done",
  failed: "Failed",
} as const;

export function OcrProgress({ progress, status }: OcrProgressProps) {
  return (
    <Stack gap="xs">
      <Group gap="sm">
        <IconScan size={20} />
        <Text size="sm" fw={500}>OCR Processing</Text>
        <Badge color={statusColors[status]} size="sm" variant="light">
          {statusLabels[status]}
        </Badge>
      </Group>
      <Progress
        value={progress}
        animated={status === "processing"}
        color={statusColors[status]}
        size="lg"
        radius="md"
      />
      <Text size="xs" c="dimmed">{progress}%</Text>
    </Stack>
  );
}
