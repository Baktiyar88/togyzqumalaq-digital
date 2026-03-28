"use client";

import { SegmentedControl } from "@mantine/core";
import { IconLanguage } from "@tabler/icons-react";
import { useState } from "react";

const languages = [
  { label: "Қаз", value: "kk" },
  { label: "Рус", value: "ru" },
  { label: "Eng", value: "en" },
];

export function LanguageSwitch() {
  const [value, setValue] = useState("kk");

  return (
    <SegmentedControl
      size="xs"
      data={languages}
      value={value}
      onChange={setValue}
    />
  );
}
