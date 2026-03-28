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
    Button: {
      defaultProps: { radius: "xl" },
      styles: {
        root: {
          transition: "all 200ms ease",
          "&:hover": { transform: "translateY(-1px)" },
        },
      },
    },
    Card: {
      defaultProps: { radius: "lg", withBorder: true },
      styles: {
        root: {
          transition: "box-shadow 200ms ease, transform 200ms ease",
          "&:hover": {
            boxShadow: "0 8px 32px rgba(99, 102, 241, 0.1)",
          },
        },
      },
    },
    TextInput: { defaultProps: { radius: "md" } },
    PasswordInput: { defaultProps: { radius: "md" } },
    Select: { defaultProps: { radius: "md" } },
    Badge: { defaultProps: { radius: "xl" } },
    ActionIcon: { defaultProps: { radius: "lg" } },
    NavLink: { defaultProps: { style: { borderRadius: 12 } } },
    Notification: { defaultProps: { radius: "lg" } },
  },
});
