import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          "vendor-query": ["@tanstack/react-query"],
          "vendor-stripe": ["@stripe/react-stripe-js", "@stripe/stripe-js"],
          "vendor-jspdf": ["jspdf"],
          "vendor-jspdf-autotable": ["jspdf-autotable"],
          "vendor-html2canvas": ["html2canvas"],
          "vendor-charts": ["recharts"],
          "vendor-socket": ["socket.io-client"],
          "vendor-forms": ["react-hook-form"],
          "vendor-ui": ["react-hot-toast", "@reduxjs/toolkit", "react-redux"],
        },
      },
    },
    chunkSizeWarningLimit: 700,
  },
});
