"use client";

import { Table, ScrollArea, Badge, Text } from "@mantine/core";
import { motion, AnimatePresence } from "motion/react";

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
    <ScrollArea h={300} aria-label="Move history">
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
          <AnimatePresence>
            {moves.map((m, i) => (
              <motion.tr
                key={`${m.moveNumber}-${m.side}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: i === moves.length - 1 ? 0 : 0 }}
                style={{
                  backgroundColor: i === currentMoveIndex ? "var(--mantine-color-indigo-light)" : undefined,
                }}
              >
                <Table.Td>{m.moveNumber}</Table.Td>
                <Table.Td>
                  <Badge color={m.side === "south" ? "blue" : "orange"} size="sm" variant="light">
                    {m.side}
                  </Badge>
                </Table.Td>
                <Table.Td>{m.pit}</Table.Td>
                <Table.Td>
                  {m.captured > 0 && (
                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500 }}>
                      <Badge color="green" size="sm">+{m.captured}</Badge>
                    </motion.span>
                  )}
                  {m.tuzdik && (
                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, delay: 0.1 }}>
                      <Badge color="red" size="sm" ml={4}>T</Badge>
                    </motion.span>
                  )}
                </Table.Td>
              </motion.tr>
            ))}
          </AnimatePresence>
        </Table.Tbody>
      </Table>
    </ScrollArea>
  );
}
