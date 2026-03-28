"use client";

import { Table, NumberInput, Select, ActionIcon, Group, Badge, Text, Button, Stack } from "@mantine/core";
import { IconCheck, IconEdit, IconTrash } from "@tabler/icons-react";
import { useState, useCallback } from "react";
import type { ParsedMove } from "@/lib/ocr/types";

interface OcrResultsProps {
  moves: ParsedMove[];
  confidence: number;
  onConfirm: (moves: ParsedMove[]) => void;
}

export function OcrResults({ moves: initialMoves, confidence, onConfirm }: OcrResultsProps) {
  const [moves, setMoves] = useState<ParsedMove[]>(initialMoves);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const updateMove = useCallback((index: number, field: keyof ParsedMove, value: unknown) => {
    setMoves((prev) =>
      prev.map((m, i) => (i === index ? { ...m, [field]: value } : m))
    );
  }, []);

  const removeMove = useCallback((index: number) => {
    setMoves((prev) => prev.filter((_, i) => i !== index));
  }, []);

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Text fw={600}>Recognized Moves ({moves.length})</Text>
        <Badge
          color={confidence >= 0.9 ? "green" : confidence >= 0.7 ? "yellow" : "red"}
          size="lg"
          variant="light"
        >
          {Math.round(confidence * 100)}% confidence
        </Badge>
      </Group>

      <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>#</Table.Th>
            <Table.Th>Side</Table.Th>
            <Table.Th>Pit</Table.Th>
            <Table.Th>Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {moves.map((move, i) => (
            <Table.Tr key={i}>
              <Table.Td>{move.moveNumber}</Table.Td>
              <Table.Td>
                {editingIndex === i ? (
                  <Select
                    size="xs"
                    data={[{ value: "white", label: "White" }, { value: "black", label: "Black" }]}
                    value={move.side}
                    onChange={(v) => updateMove(i, "side", v)}
                  />
                ) : (
                  <Badge color={move.side === "white" ? "gray" : "dark"} variant="light">
                    {move.side}
                  </Badge>
                )}
              </Table.Td>
              <Table.Td>
                {editingIndex === i ? (
                  <NumberInput size="xs" min={1} max={9} value={move.fromPit} onChange={(v) => updateMove(i, "fromPit", v)} />
                ) : (
                  move.fromPit
                )}
              </Table.Td>
              <Table.Td>
                <Group gap="xs">
                  <ActionIcon
                    size="sm"
                    variant="subtle"
                    onClick={() => setEditingIndex(editingIndex === i ? null : i)}
                  >
                    {editingIndex === i ? <IconCheck size={14} /> : <IconEdit size={14} />}
                  </ActionIcon>
                  <ActionIcon size="sm" variant="subtle" color="red" onClick={() => removeMove(i)}>
                    <IconTrash size={14} />
                  </ActionIcon>
                </Group>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>

      <Button onClick={() => onConfirm(moves)} leftSection={<IconCheck size={16} />} fullWidth>
        Confirm & Generate FEN
      </Button>
    </Stack>
  );
}
