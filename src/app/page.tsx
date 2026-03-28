"use client";

import {
  Container, Title, Text, Button, Group, Stack, ThemeIcon, SimpleGrid, Card,
  Badge, useMantineColorScheme, ActionIcon, Divider, Box,
} from "@mantine/core";
import {
  IconUpload, IconEdit, IconArchive, IconScan, IconChessKnight,
  IconSun, IconMoon, IconArrowRight, IconBrandGithub,
} from "@tabler/icons-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { LanguageSwitch } from "@/components/ui/language-switch";
import { createClient } from "@/lib/supabase/client";

const features = [
  { icon: IconScan, title: "AI OCR Recognition", description: "Upload photos of handwritten scoresheets — DeepSeek OCR extracts moves automatically with confidence scoring" },
  { icon: IconEdit, title: "Manual Move Entry", description: "Enter moves step-by-step with interactive board visualization and real-time rule validation" },
  { icon: IconArchive, title: "Game Archive", description: "Search, filter, and replay your digitized games with FEN export in TXT, JSON, and PDF formats" },
  { icon: IconUpload, title: "Batch Processing", description: "Arbiters can upload up to 20 scoresheets at once with parallel OCR and individual progress tracking" },
];

const stats = [
  { value: "162", label: "stones per game" },
  { value: "18", label: "pits on the board" },
  { value: "3", label: "languages supported" },
  { value: "< 2min", label: "to digitize a game" },
];

export default function HomePage() {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setIsLoggedIn(!!data.user);
    });
  }, []);

  return (
    <Box>
      {/* Header */}
      <Group justify="space-between" px="xl" py="md">
        <Group gap="sm">
          <IconChessKnight size={28} color="var(--mantine-color-indigo-5)" />
          <Text fw={700} size="lg">Togyzqumalaq Digital</Text>
        </Group>
        <Group gap="sm">
          <LanguageSwitch />
          <ActionIcon variant="subtle" size="lg" onClick={toggleColorScheme}>
            {colorScheme === "dark" ? <IconSun size={18} /> : <IconMoon size={18} />}
          </ActionIcon>
          {isLoggedIn ? (
            <Button component={Link} href="/upload" size="sm">Dashboard</Button>
          ) : (
            <>
              <Button component={Link} href="/login" variant="subtle" size="sm">Sign In</Button>
              <Button component={Link} href="/register" size="sm">Sign Up</Button>
            </>
          )}
        </Group>
      </Group>

      {/* Hero */}
      <Container size="lg" py={80}>
        <Stack align="center" gap="xl">
          <Badge size="lg" variant="light" color="indigo">Decentrathon 5.0 Hackathon</Badge>

          <Title order={1} ta="center" fz={{ base: 40, md: 60 }} fw={700} lh={1.1}>
            Цифровое наследие
            <br />
            <Text span c="indigo" inherit>
              Тоғызқұмалақ
            </Text>
          </Title>

          <Text size="xl" c="dimmed" ta="center" maw={650} lh={1.6}>
            AI-powered platform for digitizing tournament scoresheets
            and generating FEN notation for the ancient Kazakh board game.
            Upload a photo — get a digital record in seconds.
          </Text>

          <Group mt="md">
            <Button
              component={Link}
              href="/register"
              size="xl"
              rightSection={<IconArrowRight size={20} />}
            >
              Get Started
            </Button>
            <Button
              component={Link}
              href="/manual"
              size="xl"
              variant="light"
              leftSection={<IconEdit size={20} />}
            >
              Try the Board
            </Button>
          </Group>
        </Stack>
      </Container>

      {/* Stats */}
      <Box bg="var(--mantine-color-dark-6)" py={40}>
        <Container size="lg">
          <SimpleGrid cols={{ base: 2, sm: 4 }}>
            {stats.map((s) => (
              <Stack key={s.label} align="center" gap={4}>
                <Text fz={36} fw={700} c="indigo">{s.value}</Text>
                <Text size="sm" c="dimmed">{s.label}</Text>
              </Stack>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* Features */}
      <Container size="lg" py={80}>
        <Stack align="center" gap="xl">
          <Title order={2} ta="center">How It Works</Title>
          <Text c="dimmed" ta="center" maw={500}>
            From paper scoresheet to digital archive in four simple steps
          </Text>

          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xl" mt="lg">
            {features.map((f, i) => (
              <Card key={f.title} padding="xl" withBorder radius="lg">
                <Group gap="lg" align="flex-start">
                  <ThemeIcon size={56} radius="lg" variant="light" color="indigo">
                    <f.icon size={28} />
                  </ThemeIcon>
                  <Stack gap="xs" style={{ flex: 1 }}>
                    <Group gap="xs">
                      <Badge size="sm" variant="outline" color="dimmed">{i + 1}</Badge>
                      <Text fw={600} size="lg">{f.title}</Text>
                    </Group>
                    <Text size="sm" c="dimmed" lh={1.6}>{f.description}</Text>
                  </Stack>
                </Group>
              </Card>
            ))}
          </SimpleGrid>
        </Stack>
      </Container>

      {/* Footer */}
      <Divider />
      <Container size="lg" py="xl">
        <Group justify="space-between">
          <Group gap="sm">
            <IconChessKnight size={20} color="var(--mantine-color-dimmed)" />
            <Text size="sm" c="dimmed">
              Togyzqumalaq Digital — Decentrathon 5.0
            </Text>
          </Group>
          <Text size="sm" c="dimmed">
            Built with Next.js, Mantine UI, Supabase, DeepSeek OCR
          </Text>
        </Group>
      </Container>
    </Box>
  );
}
