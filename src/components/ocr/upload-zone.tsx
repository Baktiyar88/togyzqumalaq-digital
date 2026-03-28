"use client";

import { Group, Text, rem } from "@mantine/core";
import { Dropzone, IMAGE_MIME_TYPE, PDF_MIME_TYPE } from "@mantine/dropzone";
import { IconUpload, IconPhoto, IconX } from "@tabler/icons-react";

interface UploadZoneProps {
  onDrop: (files: File[]) => void;
  loading?: boolean;
}

export function UploadZone({ onDrop, loading }: UploadZoneProps) {
  return (
    <Dropzone
      onDrop={onDrop}
      maxSize={20 * 1024 * 1024}
      accept={[...IMAGE_MIME_TYPE, ...PDF_MIME_TYPE]}
      loading={loading}
      multiple={false}
    >
      <Group justify="center" gap="xl" mih={220} style={{ pointerEvents: "none" }}>
        <Dropzone.Accept>
          <IconUpload style={{ width: rem(52), height: rem(52) }} stroke={1.5} />
        </Dropzone.Accept>
        <Dropzone.Reject>
          <IconX style={{ width: rem(52), height: rem(52) }} stroke={1.5} color="var(--mantine-color-red-6)" />
        </Dropzone.Reject>
        <Dropzone.Idle>
          <IconPhoto style={{ width: rem(52), height: rem(52) }} stroke={1.5} color="var(--mantine-color-dimmed)" />
        </Dropzone.Idle>

        <div>
          <Text size="xl" inline>
            Drag scoresheet here or click to select
          </Text>
          <Text size="sm" c="dimmed" inline mt={7}>
            JPEG, PNG, PDF — up to 20MB
          </Text>
        </div>
      </Group>
    </Dropzone>
  );
}
