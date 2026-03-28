"use client";

import { SegmentedControl } from "@mantine/core";
import { useI18n } from "@/lib/i18n/context";

const languages = [
  { label: "Қаз", value: "kk" },
  { label: "Рус", value: "ru" },
  { label: "Eng", value: "en" },
];

export function LanguageSwitch() {
  const { locale, setLocale } = useI18n();

  return (
    <SegmentedControl
      size="xs"
      data={languages}
      value={locale}
      onChange={(v) => setLocale(v as "kk" | "ru" | "en")}
    />
  );
}
