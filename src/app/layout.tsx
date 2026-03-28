import "@mantine/core/styles.css";
import "@mantine/dropzone/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/dates/styles.css";

import type { Metadata } from "next";
import { ColorSchemeScript, MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { theme } from "@/lib/theme/theme";
import { AppLayout } from "@/components/ui/app-shell";
import { I18nProvider } from "@/lib/i18n/context";
import { SkipLink } from "@/components/ui/skip-link";

export const metadata: Metadata = {
  title: "Togyzqumalaq Digital",
  description: "Digitize tournament scoresheets and generate FEN notation for togyzkumalaq",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="kk" suppressHydrationWarning>
      <head>
        <ColorSchemeScript defaultColorScheme="dark" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Space+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <SkipLink />
        <MantineProvider theme={theme} defaultColorScheme="dark">
          <Notifications position="top-right" />
          <I18nProvider>
            <AppLayout>{children}</AppLayout>
          </I18nProvider>
        </MantineProvider>
      </body>
    </html>
  );
}
