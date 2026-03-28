"use client";

import { AppShell, Burger, Group, NavLink, Text, ActionIcon, useMantineColorScheme, Avatar } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconUpload,
  IconEdit,
  IconArchive,
  IconUser,
  IconSun,
  IconMoon,
  IconChessKnight,
  IconLogin,
  IconLogout,
} from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LanguageSwitch } from "./language-switch";
import { useI18n } from "@/lib/i18n/context";
import type { ReactNode } from "react";

const navKeys = [
  { href: "/upload", labelKey: "nav.upload", icon: IconUpload },
  { href: "/manual", labelKey: "nav.manual", icon: IconEdit },
  { href: "/archive", labelKey: "nav.archive", icon: IconArchive },
  { href: "/profile", labelKey: "nav.profile", icon: IconUser },
];

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [opened, { toggle, close }] = useDisclosure();
  const pathname = usePathname();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const { t } = useI18n();

  const isAuthPage = pathname === "/login" || pathname === "/register";
  const isLanding = pathname === "/";

  if (isAuthPage || isLanding) {
    return <>{children}</>;
  }

  return (
    <AppShell
      padding="md"
      header={{ height: 60 }}
      navbar={{
        width: 260,
        breakpoint: "sm",
        collapsed: { mobile: !opened },
      }}
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group gap="sm">
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <IconChessKnight size={28} color="var(--mantine-color-indigo-5)" />
            <Text
              component={Link}
              href="/"
              fw={700}
              size="lg"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              Togyzqumalaq
            </Text>
          </Group>

          <Group gap="sm">
            <LanguageSwitch />
            <ActionIcon
              variant="subtle"
              size="lg"
              onClick={toggleColorScheme}
              aria-label="Toggle theme"
            >
              {colorScheme === "dark" ? <IconSun size={18} /> : <IconMoon size={18} />}
            </ActionIcon>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        {navKeys.map((item) => (
          <NavLink
            key={item.href}
            component={Link}
            href={item.href}
            label={t(item.labelKey)}
            leftSection={<item.icon size={20} />}
            active={pathname === item.href || pathname.startsWith(item.href + "/")}
            onClick={close}
            variant="light"
            mb={4}
          />
        ))}
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
