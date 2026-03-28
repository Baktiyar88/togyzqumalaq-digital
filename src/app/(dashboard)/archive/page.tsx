"use client";

import { useState, useEffect, useRef } from "react";
import { Container, Title, Stack, TextInput, Group, Table, Badge, ActionIcon, Tooltip, Pagination, Card, Text, FileInput, Button, Select } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { IconSearch, IconPlayerPlay, IconFileExport, IconFileImport } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import Link from "next/link";
import { searchGames } from "@/actions/games";
import { importFenFile } from "@/actions/fen-import";
import type { Game } from "@/lib/supabase/types";
import type { GameResult } from "@/lib/supabase/types";

const resultColors: Record<string, string> = {
  white: "blue",
  black: "orange",
  draw: "gray",
  ongoing: "yellow",
};

export default function ArchivePage() {
  const [games, setGames] = useState<Game[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [dateFrom, setDateFrom] = useState<Date | null>(null);
  const [dateTo, setDateTo] = useState<Date | null>(null);
  const [resultFilter, setResultFilter] = useState<GameResult | null>(null);
  const [loading, setLoading] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function toIsoDate(d: Date | null): string | undefined {
    if (!d) return undefined;
    return d.toISOString().split("T")[0];
  }

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      async function load() {
        setLoading(true);
        const result = await searchGames({
          tournament: query || undefined,
          dateFrom: toIsoDate(dateFrom),
          dateTo: toIsoDate(dateTo),
          result: resultFilter ?? undefined,
          page,
        });
        setGames(result.games);
        setTotal(result.total);
        setLoading(false);
      }
      load();
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [page, query, dateFrom, dateTo, resultFilter]);

  const totalPages = Math.ceil(total / 20);

  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        <Group justify="space-between" align="end">
          <Title order={2}>Game Archive</Title>
          <FileInput
            placeholder="Import FEN file"
            accept=".fen,.txt"
            leftSection={<IconFileImport size={16} />}
            w={220}
            size="sm"
            onChange={async (file) => {
              if (!file) return;
              const content = await file.text();
              const result = await importFenFile(content);
              if (result.valid) {
                notifications.show({ title: "FEN Imported", message: `${result.moveCount} positions loaded`, color: "green" });
              } else {
                notifications.show({ title: "Import failed", message: result.error ?? "Invalid FEN", color: "red" });
              }
            }}
          />
        </Group>

        <TextInput
          placeholder="Search by tournament, notes..."
          leftSection={<IconSearch size={16} />}
          value={query}
          onChange={(e) => { setQuery(e.currentTarget.value); setPage(1); }}
          size="md"
        />

        <Group grow>
          <DatePickerInput
            label="From"
            placeholder="Start date"
            value={dateFrom}
            onChange={(v) => { setDateFrom(v); setPage(1); }}
            clearable
          />
          <DatePickerInput
            label="To"
            placeholder="End date"
            value={dateTo}
            onChange={(v) => { setDateTo(v); setPage(1); }}
            clearable
          />
          <Select
            label="Result"
            placeholder="All results"
            data={[
              { value: "white", label: "White win" },
              { value: "black", label: "Black win" },
              { value: "draw", label: "Draw" },
              { value: "ongoing", label: "Ongoing" },
            ]}
            value={resultFilter}
            onChange={(v) => { setResultFilter(v as GameResult | null); setPage(1); }}
            clearable
          />
        </Group>

        {games.length === 0 && !loading ? (
          <Card padding="xl" withBorder>
            <Text ta="center" c="dimmed">No games found. Upload a scoresheet or enter a game manually.</Text>
          </Card>
        ) : (
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Date</Table.Th>
                <Table.Th>Source</Table.Th>
                <Table.Th>Result</Table.Th>
                <Table.Th>Round</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {games.map((game) => (
                <Table.Tr key={game.id}>
                  <Table.Td>{game.date_played ?? "—"}</Table.Td>
                  <Table.Td>
                    <Badge size="sm" variant="light" color={game.source_type === "ocr" ? "indigo" : "teal"}>
                      {game.source_type ?? "—"}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Badge color={resultColors[game.result ?? "ongoing"]} size="sm" variant="light">
                      {game.result ?? "ongoing"}
                    </Badge>
                  </Table.Td>
                  <Table.Td>{game.round ?? "—"}</Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <Tooltip label="Replay">
                        <ActionIcon component={Link} href={`/game/${game.id}`} variant="subtle" size="sm">
                          <IconPlayerPlay size={14} />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label="Export FEN">
                        <ActionIcon variant="subtle" size="sm">
                          <IconFileExport size={14} />
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}

        {totalPages > 1 && (
          <Group justify="center">
            <Pagination total={totalPages} value={page} onChange={setPage} />
          </Group>
        )}
      </Stack>
    </Container>
  );
}
