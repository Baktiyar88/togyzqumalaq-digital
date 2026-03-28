import { createTheme, type MantineColorsTuple } from "@mantine/core";

const indigo: MantineColorsTuple = [
  "#eef2ff", "#e0e7ff", "#c7d2fe", "#a5b4fc", "#818cf8",
  "#6366f1", "#4f46e5", "#4338ca", "#3730a3", "#312e81",
];

const emerald: MantineColorsTuple = [
  "#ecfdf5", "#d1fae5", "#a7f3d0", "#6ee7b7", "#34d399",
  "#10b981", "#059669", "#047857", "#065f46", "#064e3b",
];

export const theme = createTheme({
  primaryColor: "indigo",
  colors: { indigo, emerald },
  fontFamily: "'DM Sans', sans-serif",
  headings: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontWeight: "700",
  },
  defaultRadius: "md",
  cursorType: "pointer",
  components: {
    Button: { defaultProps: { radius: "md" } },
    Card: { defaultProps: { radius: "lg", withBorder: true } },
    TextInput: { defaultProps: { radius: "md" } },
    Select: { defaultProps: { radius: "md" } },
  },
});
