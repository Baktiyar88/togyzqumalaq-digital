"use client";

import { useState } from "react";
import { Container, Card, Title, TextInput, PasswordInput, Button, Stack, Text, Anchor, Group } from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { IconLogin } from "@tabler/icons-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const form = useForm({
    initialValues: { email: "", password: "" },
    validate: {
      email: (v) => (/^\S+@\S+$/.test(v) ? null : "Invalid email"),
      password: (v) => (v.length >= 1 ? null : "Required"),
    },
  });

  async function handleSubmit(values: typeof form.values) {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword(values);
    setLoading(false);

    if (error) {
      notifications.show({ title: "Login failed", message: error.message, color: "red" });
      return;
    }

    window.location.href = "/upload";
  }

  return (
    <Container size={420} py={80}>
      <Stack align="center" gap="md">
        <Title order={2}>Sign In</Title>
        <Text c="dimmed" size="sm">Enter your credentials</Text>
      </Stack>

      <Card withBorder padding="lg" mt="xl" radius="md">
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <TextInput label="Email" placeholder="your@email.com" required {...form.getInputProps("email")} />
            <PasswordInput label="Password" placeholder="••••••••" required {...form.getInputProps("password")} />
            <Button type="submit" fullWidth loading={loading} leftSection={<IconLogin size={16} />}>
              Sign In
            </Button>
          </Stack>
        </form>
      </Card>

      <Group justify="center" mt="md">
        <Text size="sm" c="dimmed">
          No account?{" "}
          <Anchor component={Link} href="/register" size="sm">Sign Up</Anchor>
        </Text>
      </Group>
    </Container>
  );
}
