import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  nitro: false,
  vite: {
    preview: {
      allowedHosts: true,
    },
  },
  tanstackStart: {
    server: { entry: "server" },
  },
});
