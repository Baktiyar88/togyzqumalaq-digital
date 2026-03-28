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
import type { ReactNode } from "react";

const navItems = [
  { href: "/upload", label: "Upload", icon: IconUpload },
  { href: "/manual", label: "Manual Entry", icon: IconEdit },
  { href: "/archive", label: "Archive", icon: IconArchive },
  { href: "/profile", label: "Profile", icon: IconUser },
];

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [opened, { toggle, close }] = useDisclosure();
  const pathname = usePathname();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

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
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            component={Link}
            href={item.href}
            label={item.label}
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
