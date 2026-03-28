"use client";

import { useState, useEffect } from "react";
import { Container, Title, Stack, TextInput, Group, Table, Badge, ActionIcon, Tooltip, Pagination, Card, Text } from "@mantine/core";
import { IconSearch, IconPlayerPlay, IconFileExport } from "@tabler/icons-react";
import Link from "next/link";
import { searchGames } from "@/actions/games";
import type { Game } from "@/lib/supabase/types";

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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const result = await searchGames({ tournament: query || undefined, page });
      setGames(result.games);
      setTotal(result.total);
      setLoading(false);
    }
    load();
  }, [page, query]);

  const totalPages = Math.ceil(total / 20);

  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        <Title order={2}>Game Archive</Title>

        <TextInput
          placeholder="Search by tournament, notes..."
          leftSection={<IconSearch size={16} />}
          value={query}
          onChange={(e) => { setQuery(e.currentTarget.value); setPage(1); }}
          size="md"
        />

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
