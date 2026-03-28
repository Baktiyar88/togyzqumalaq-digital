"use client";

import { Table, ScrollArea, Badge, Text } from "@mantine/core";

interface MoveEntry {
  moveNumber: number;
  side: "south" | "north";
  pit: number;
  captured: number;
  tuzdik: boolean;
}

interface MoveListProps {
  moves: MoveEntry[];
  currentMoveIndex?: number;
}

export function MoveList({ moves, currentMoveIndex }: MoveListProps) {
  if (moves.length === 0) {
    return <Text c="dimmed" size="sm" ta="center">No moves yet</Text>;
  }

  return (
    <ScrollArea h={300}>
      <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>#</Table.Th>
            <Table.Th>Side</Table.Th>
            <Table.Th>Pit</Table.Th>
            <Table.Th>Captured</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {moves.map((m, i) => (
            <Table.Tr
              key={i}
              bg={i === currentMoveIndex ? "var(--mantine-color-indigo-light)" : undefined}
            >
              <Table.Td>{m.moveNumber}</Table.Td>
              <Table.Td>
                <Badge color={m.side === "south" ? "blue" : "orange"} size="sm" variant="light">
                  {m.side}
                </Badge>
              </Table.Td>
              <Table.Td>{m.pit}</Table.Td>
              <Table.Td>
                {m.captured > 0 && <Badge color="green" size="sm">+{m.captured}</Badge>}
                {m.tuzdik && <Badge color="red" size="sm" ml={4}>T</Badge>}
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </ScrollArea>
  );
}
