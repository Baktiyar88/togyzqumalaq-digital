"use client";

import { Container, Alert, Button, Stack } from "@mantine/core";
import { IconAlertTriangle } from "@tabler/icons-react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DashboardError({ error, reset }: ErrorProps) {
  return (
    <Container size="md" py="xl">
      <Stack gap="md">
        <Alert
          icon={<IconAlertTriangle size={16} />}
          color="red"
          title="Something went wrong"
        >
          {error.message || "An unexpected error occurred. Please try again."}
        </Alert>
        <Button variant="light" onClick={reset}>
          Try again
        </Button>
      </Stack>
    </Container>
  );
}
