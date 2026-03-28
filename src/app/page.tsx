"use client";

import {
  Container, Title, Text, Button, Group, Stack, ThemeIcon, SimpleGrid, Card,
  Badge, useMantineColorScheme, ActionIcon, Divider, Box,
} from "@mantine/core";
import {
  IconUpload, IconEdit, IconArchive, IconScan, IconChessKnight,
  IconSun, IconMoon, IconArrowRight,
} from "@tabler/icons-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { LanguageSwitch } from "@/components/ui/language-switch";
import { useI18n } from "@/lib/i18n/context";
import { createClient } from "@/lib/supabase/client";

const featureIcons = [IconScan, IconEdit, IconArchive, IconUpload];

export default function HomePage() {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const { t } = useI18n();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setIsLoggedIn(!!data.user);
    });
  }, []);

  const features = [
    { icon: IconScan, title: t("landing.feature1_title"), description: t("landing.feature1_desc") },
    { icon: IconEdit, title: t("landing.feature2_title"), description: t("landing.feature2_desc") },
    { icon: IconArchive, title: t("landing.feature3_title"), description: t("landing.feature3_desc") },
    { icon: IconUpload, title: t("landing.feature4_title"), description: t("landing.feature4_desc") },
  ];

  const stats = [
    { value: "162", label: t("landing.stat1") },
    { value: "18", label: t("landing.stat2") },
    { value: "3", label: t("landing.stat3") },
    { value: "< 2min", label: t("landing.stat4") },
  ];

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
          <ActionIcon variant="subtle" size="lg" onClick={toggleColorScheme} aria-label="Toggle theme">
            {colorScheme === "dark" ? <IconSun size={18} /> : <IconMoon size={18} />}
          </ActionIcon>
          {isLoggedIn ? (
            <Button component={Link} href="/upload" size="sm">{t("landing.dashboard")}</Button>
          ) : (
            <>
              <Button component={Link} href="/login" variant="subtle" size="sm">{t("nav.login")}</Button>
              <Button component={Link} href="/register" size="sm">{t("nav.register")}</Button>
            </>
          )}
        </Group>
      </Group>

      {/* Hero */}
      <Container size="lg" py={80}>
        <Stack align="center" gap="xl">
          <Badge size="lg" variant="light" color="indigo">Decentrathon 5.0</Badge>

          <Title order={1} ta="center" fz={{ base: 40, md: 60 }} fw={700} lh={1.1}>
            {t("landing.hero_title")}
            <br />
            <Text span c="indigo" inherit>
              Тоғызқұмалақ
            </Text>
          </Title>

          <Text size="xl" c="dimmed" ta="center" maw={650} lh={1.6}>
            {t("landing.hero_subtitle")}
          </Text>

          <Group mt="md">
            <Button
              component={Link}
              href={isLoggedIn ? "/upload" : "/register"}
              size="xl"
              rightSection={<IconArrowRight size={20} />}
            >
              {t("landing.cta_start")}
            </Button>
            <Button
              component={Link}
              href="/manual"
              size="xl"
              variant="light"
              leftSection={<IconEdit size={20} />}
            >
              {t("landing.cta_board")}
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
          <Title order={2} ta="center">{t("landing.how_title")}</Title>
          <Text c="dimmed" ta="center" maw={500}>{t("landing.how_subtitle")}</Text>

          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xl" mt="lg">
            {features.map((f, i) => (
              <Card key={i} padding="xl" withBorder radius="lg">
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
            <Text size="sm" c="dimmed">Togyzqumalaq Digital — Decentrathon 5.0</Text>
          </Group>
          <Text size="sm" c="dimmed">Next.js + Mantine UI + Supabase + DeepSeek OCR</Text>
        </Group>
      </Container>
    </Box>
  );
}
