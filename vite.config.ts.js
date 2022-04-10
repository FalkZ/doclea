// vite.config.ts
import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import path from "path";
import "rollup-plugin-polyfill-node";
var vite_config_default = defineConfig({
  resolve: {
    alias: {
      "@": path.resolve("D:\\ZHAW\\Coding\\PM4\\doclea", "./src"),
      "@lib": path.resolve("D:\\ZHAW\\Coding\\PM4\\doclea", "./src/lib"),
      "@github-adapter": path.resolve("D:\\ZHAW\\Coding\\PM4\\doclea", "./src/github-adapter")
    }
  },
  plugins: [svelte()],
  optimizeDeps: {
    exclude: ["@inrupt/solid-client"]
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gJ3ZpdGUnXHJcbmltcG9ydCB7IHN2ZWx0ZSB9IGZyb20gJ0BzdmVsdGVqcy92aXRlLXBsdWdpbi1zdmVsdGUnXHJcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXHJcblxyXG5pbXBvcnQgcG9seWZpbGxOb2RlIGZyb20gJ3JvbGx1cC1wbHVnaW4tcG9seWZpbGwtbm9kZSdcclxuXHJcbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXHJcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XHJcbiAgcmVzb2x2ZToge1xyXG4gICAgYWxpYXM6IHtcclxuICAgICAgJ0AnOiBwYXRoLnJlc29sdmUoXCJEOlxcXFxaSEFXXFxcXENvZGluZ1xcXFxQTTRcXFxcZG9jbGVhXCIsICcuL3NyYycpLFxyXG4gICAgICAnQGxpYic6IHBhdGgucmVzb2x2ZShcIkQ6XFxcXFpIQVdcXFxcQ29kaW5nXFxcXFBNNFxcXFxkb2NsZWFcIiwgJy4vc3JjL2xpYicpLFxyXG4gICAgICAnQGdpdGh1Yi1hZGFwdGVyJzogcGF0aC5yZXNvbHZlKFwiRDpcXFxcWkhBV1xcXFxDb2RpbmdcXFxcUE00XFxcXGRvY2xlYVwiLCAnLi9zcmMvZ2l0aHViLWFkYXB0ZXInKSxcclxuICAgIH0sXHJcbiAgfSxcclxuICBwbHVnaW5zOiBbc3ZlbHRlKCldLFxyXG4gIG9wdGltaXplRGVwczoge1xyXG4gICAgZXhjbHVkZTogWydAaW5ydXB0L3NvbGlkLWNsaWVudCddLCAvLyA8LSBtb2R1bGVzIHRoYXQgbmVlZHMgc2hpbW1pbmcgaGF2ZSB0byBiZSBleGNsdWRlZCBmcm9tIGRlcCBvcHRpbWl6YXRpb25cclxuICB9LFxyXG59KVxyXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQUE7QUFDQTtBQUNBO0FBRUE7QUFHQSxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsTUFDTCxLQUFLLEtBQUssUUFBUSxpQ0FBaUM7QUFBQSxNQUNuRCxRQUFRLEtBQUssUUFBUSxpQ0FBaUM7QUFBQSxNQUN0RCxtQkFBbUIsS0FBSyxRQUFRLGlDQUFpQztBQUFBO0FBQUE7QUFBQSxFQUdyRSxTQUFTLENBQUM7QUFBQSxFQUNWLGNBQWM7QUFBQSxJQUNaLFNBQVMsQ0FBQztBQUFBO0FBQUE7IiwKICAibmFtZXMiOiBbXQp9Cg==
