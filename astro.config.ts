import mdx from "@astrojs/mdx";
import tailwindcss from "@tailwindcss/vite";
import { FontaineTransform } from "fontaine";
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://qyl.at",
  output: "static",
  integrations: [mdx()],
  build: {
    inlineStylesheets: "auto",
  },
  markdown: {
    shikiConfig: {
      theme: "github-dark-default",
      wrap: true,
    },
  },
  vite: {
    build: {
      assetsInlineLimit: 0,
      target: ["chrome111", "edge111", "firefox128", "safari16.4"],
    },
    plugins: [
      tailwindcss(),
      FontaineTransform.vite({
        fallbacks: { Geist: ["Arial"] },
        fallbackName: () => "Geist override",
        resolvePath: (id) => new URL(`./public${id}`, import.meta.url),
      }),
    ],
  },
});
