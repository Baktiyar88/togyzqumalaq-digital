"use client";

import { Code, CopyButton, ActionIcon, Tooltip, Group, Stack, Text } from "@mantine/core";
import { IconCopy, IconCheck, IconDownload } from "@tabler/icons-react";

interface FenDisplayProps {
  fen: string;
  label?: string;
}

export function FenDisplay({ fen, label = "FEN" }: FenDisplayProps) {
  const downloadFen = () => {
    const blob = new Blob([fen], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "game.fen";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Stack gap="xs">
      <Group justify="space-between">
        <Text size="sm" fw={500}>{label}</Text>
        <Group gap="xs">
          <CopyButton value={fen}>
            {({ copied, copy }) => (
              <Tooltip label={copied ? "Copied" : "Copy FEN"}>
                <ActionIcon color={copied ? "teal" : "gray"} variant="subtle" onClick={copy}>
                  {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                </ActionIcon>
              </Tooltip>
            )}
          </CopyButton>
          <Tooltip label="Download FEN">
            <ActionIcon variant="subtle" onClick={downloadFen}>
              <IconDownload size={16} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>
      <Code block style={{ fontSize: "0.75rem", wordBreak: "break-all" }}>
        {fen}
      </Code>
    </Stack>
  );
}
