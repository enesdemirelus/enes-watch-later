"use client";

import { MantineProvider, createTheme } from "@mantine/core";

const theme = createTheme({
  primaryColor: "red",
  defaultRadius: "md",
  fontFamily: "Arial, Helvetica, sans-serif",
  components: {
    TextInput: {
      styles: {
        input: {
          backgroundColor: "#1a1a1a",
          borderColor: "#333",
          color: "#ededed",
          "&::placeholder": { color: "#666" },
          "&:focus": { borderColor: "#e03131" },
        },
      },
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return <MantineProvider theme={theme} defaultColorScheme="dark">{children}</MantineProvider>;
}
