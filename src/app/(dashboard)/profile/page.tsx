"use client";

import { useState, useEffect } from "react";
import { Container, Title, Card, Stack, TextInput, Select, Button, Avatar, Group, FileInput, Text, Loader, Center } from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { IconUser, IconUpload } from "@tabler/icons-react";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/supabase/types";

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  const form = useForm({
    initialValues: { display_name: "", club: "", locale: "kk" },
  });

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (data) {
        setProfile(data as Profile);
        form.setValues({
          display_name: data.display_name ?? "",
          club: data.club ?? "",
          locale: data.locale ?? "kk",
        });
      }
      setLoading(false);
    }
    load();
  }, []);

  async function handleSave(values: typeof form.values) {
    if (!profile) return;
    setSaving(true);

    const { error } = await supabase
      .from("profiles")
      .update(values)
      .eq("id", profile.id);

    setSaving(false);
    if (error) {
      notifications.show({ title: "Error", message: error.message, color: "red" });
    } else {
      notifications.show({ title: "Saved", message: "Profile updated", color: "green" });
    }
  }

  if (loading) return <Center h={400}><Loader /></Center>;

  return (
    <Container size="sm" py="xl">
      <Title order={2} mb="xl">Profile</Title>

      <Card withBorder padding="lg" radius="md">
        <form onSubmit={form.onSubmit(handleSave)}>
          <Stack gap="md">
            <Group>
              <Avatar size="xl" radius="xl" color="indigo" src={profile?.avatar_url ?? undefined}>
                <IconUser size={32} />
              </Avatar>
              <div>
                <Text fw={600}>{profile?.display_name}</Text>
                <Text size="sm" c="dimmed">{profile?.role}</Text>
              </div>
            </Group>

            <FileInput
              label="Avatar"
              placeholder="Upload avatar image"
              accept="image/png,image/jpeg,image/webp"
              leftSection={<IconUpload size={16} />}
              onChange={async (file) => {
                if (!file || !profile) return;
                const ext = file.name.split(".").pop() ?? "png";
                const path = `${profile.id}/avatar.${ext}`;
                const { error: uploadError } = await supabase.storage
                  .from("avatars")
                  .upload(path, file, { upsert: true });
                if (uploadError) {
                  notifications.show({ title: "Upload failed", message: uploadError.message, color: "red" });
                  return;
                }
                const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
                const avatarUrl = urlData.publicUrl;
                const { error: updateError } = await supabase
                  .from("profiles")
                  .update({ avatar_url: avatarUrl })
                  .eq("id", profile.id);
                if (updateError) {
                  notifications.show({ title: "Update failed", message: updateError.message, color: "red" });
                  return;
                }
                setProfile({ ...profile, avatar_url: avatarUrl });
                notifications.show({ title: "Avatar updated", message: "Your avatar has been changed", color: "green" });
              }}
            />

            <TextInput label="Display Name" required {...form.getInputProps("display_name")} />
            <TextInput label="Club" placeholder="Your club (optional)" {...form.getInputProps("club")} />
            <Select
              label="Language"
              data={[
                { value: "kk", label: "Қазақша" },
                { value: "ru", label: "Русский" },
                { value: "en", label: "English" },
              ]}
              {...form.getInputProps("locale")}
            />

            <Button type="submit" loading={saving}>Save Changes</Button>
          </Stack>
        </form>
      </Card>
    </Container>
  );
}
