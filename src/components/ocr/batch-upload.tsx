"use client";

import { useState } from "react";
import { Stack, Group, Text, Progress, Badge, ActionIcon, Card, Button } from "@mantine/core";
import { Dropzone, IMAGE_MIME_TYPE, PDF_MIME_TYPE } from "@mantine/dropzone";
import { IconUpload, IconPhoto, IconX, IconRefresh, IconCheck } from "@tabler/icons-react";

interface FileJob {
  file: File;
  status: "pending" | "uploading" | "processing" | "done" | "error";
  progress: number;
  error?: string;
}

interface BatchUploadProps {
  onProcessFile: (file: File) => Promise<void>;
}

export function BatchUpload({ onProcessFile }: BatchUploadProps) {
  const [jobs, setJobs] = useState<FileJob[]>([]);
  const [running, setRunning] = useState(false);

  function handleDrop(files: File[]) {
    const newJobs: FileJob[] = files.map((file) => ({
      file,
      status: "pending",
      progress: 0,
    }));
    setJobs((prev) => [...prev, ...newJobs]);
  }

  async function processAll() {
    setRunning(true);
    for (let i = 0; i < jobs.length; i++) {
      if (jobs[i].status !== "pending") continue;

      setJobs((prev) =>
        prev.map((j, idx) => (idx === i ? { ...j, status: "uploading", progress: 20 } : j))
      );

      try {
        setJobs((prev) =>
          prev.map((j, idx) => (idx === i ? { ...j, status: "processing", progress: 60 } : j))
        );
        await onProcessFile(jobs[i].file);
        setJobs((prev) =>
          prev.map((j, idx) => (idx === i ? { ...j, status: "done", progress: 100 } : j))
        );
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed";
        setJobs((prev) =>
          prev.map((j, idx) => (idx === i ? { ...j, status: "error", progress: 0, error: msg } : j))
        );
      }
    }
    setRunning(false);
  }

  function retryJob(index: number) {
    setJobs((prev) =>
      prev.map((j, i) => (i === index ? { ...j, status: "pending", progress: 0, error: undefined } : j))
    );
  }

  function removeJob(index: number) {
    setJobs((prev) => prev.filter((_, i) => i !== index));
  }

  const statusColors: Record<string, string> = {
    pending: "gray", uploading: "blue", processing: "indigo", done: "green", error: "red",
  };

  return (
    <Stack gap="md">
      <Dropzone
        onDrop={handleDrop}
        maxSize={20 * 1024 * 1024}
        accept={[...IMAGE_MIME_TYPE, ...PDF_MIME_TYPE]}
        disabled={running}
        multiple
      >
        <Group justify="center" gap="xl" mih={120} style={{ pointerEvents: "none" }}>
          <Dropzone.Accept><IconUpload size={40} stroke={1.5} /></Dropzone.Accept>
          <Dropzone.Reject><IconX size={40} stroke={1.5} color="var(--mantine-color-red-6)" /></Dropzone.Reject>
          <Dropzone.Idle><IconPhoto size={40} stroke={1.5} color="var(--mantine-color-dimmed)" /></Dropzone.Idle>
          <div>
            <Text size="lg" inline>Drop up to 20 scoresheets</Text>
            <Text size="sm" c="dimmed" inline mt={4}>JPEG, PNG, PDF — 20MB each</Text>
          </div>
        </Group>
      </Dropzone>

      {jobs.length > 0 && (
        <>
          <Group justify="space-between">
            <Text fw={600}>{jobs.length} files</Text>
            <Button onClick={processAll} loading={running} disabled={jobs.every((j) => j.status === "done")}>
              Process All
            </Button>
          </Group>

          {jobs.map((job, i) => (
            <Card key={i} padding="sm" withBorder>
              <Group justify="space-between" mb="xs">
                <Group gap="sm">
                  <Text size="sm" fw={500} truncate maw={200}>{job.file.name}</Text>
                  <Badge color={statusColors[job.status]} size="sm" variant="light">{job.status}</Badge>
                </Group>
                <Group gap={4}>
                  {job.status === "error" && (
                    <ActionIcon size="sm" variant="subtle" onClick={() => retryJob(i)}>
                      <IconRefresh size={14} />
                    </ActionIcon>
                  )}
                  <ActionIcon size="sm" variant="subtle" color="red" onClick={() => removeJob(i)} disabled={running}>
                    <IconX size={14} />
                  </ActionIcon>
                </Group>
              </Group>
              <Progress value={job.progress} color={statusColors[job.status]} size="sm" animated={job.status === "processing"} />
              {job.error && <Text size="xs" c="red" mt={4}>{job.error}</Text>}
            </Card>
          ))}
        </>
      )}
    </Stack>
  );
}
