import { defineConfig } from "vite";
import tailwindcss from "tailwindcss";

export default defineConfig({
  //... other configurations...
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: '@import "styles.css";',
      },
    },
    postcss: {
      plugins: [tailwindcss()],
    },
  },
});
