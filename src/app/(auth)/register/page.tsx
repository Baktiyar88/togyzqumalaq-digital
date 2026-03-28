"use client";

import { useState } from "react";
import { Container, Card, Title, TextInput, PasswordInput, Button, Stack, Text, Anchor, Group, Select } from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { IconUserPlus } from "@tabler/icons-react";
import Link from "next/link";
import { serverRegister } from "@/actions/auth";
import { AltchaWidget } from "@/components/ui/altcha-widget";

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);

  const form = useForm({
    initialValues: { email: "", password: "", displayName: "", locale: "kk" },
    validate: {
      email: (v) => (/^\S+@\S+$/.test(v) ? null : "Invalid email"),
      password: (v) => (v.length >= 8 ? null : "Min 8 characters"),
      displayName: (v) => (v.length >= 2 ? null : "Min 2 characters"),
    },
  });

  async function handleSubmit(values: typeof form.values) {
    setLoading(true);
    const result = await serverRegister(values.email, values.password, values.displayName, values.locale);
    setLoading(false);

    if (!result.success) {
      notifications.show({ title: "Registration failed", message: result.error ?? "Unknown error", color: "red" });
      return;
    }

    notifications.show({ title: "Success", message: "Account created! You can now sign in.", color: "green" });
    window.location.href = "/login";
  }

  return (
    <Container size={420} py={80}>
      <Stack align="center" gap="md">
        <Title order={2}>Sign Up</Title>
        <Text c="dimmed" size="sm">Create your Togyzqumalaq Digital account</Text>
      </Stack>

      <Card withBorder padding="lg" mt="xl" radius="md">
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <TextInput label="Name" placeholder="Your name" required {...form.getInputProps("displayName")} />
            <TextInput label="Email" placeholder="your@email.com" required {...form.getInputProps("email")} />
            <PasswordInput label="Password" placeholder="Min 8 characters" required {...form.getInputProps("password")} />
            <Select
              label="Language"
              data={[
                { value: "kk", label: "Қазақша" },
                { value: "ru", label: "Русский" },
                { value: "en", label: "English" },
              ]}
              {...form.getInputProps("locale")}
            />
            <AltchaWidget onVerify={() => {}} />
            <Button type="submit" fullWidth loading={loading} leftSection={<IconUserPlus size={16} />}>
              Create Account
            </Button>
          </Stack>
        </form>
      </Card>

      <Group justify="center" mt="md">
        <Text size="sm" c="dimmed">
          Already have account?{" "}
          <Anchor component={Link} href="/login" size="sm">Sign In</Anchor>
        </Text>
      </Group>
    </Container>
  );
}
