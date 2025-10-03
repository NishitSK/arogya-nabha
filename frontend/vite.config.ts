import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Environment-specific configuration
  const isDevelopment = mode === 'development';
  const backendUrl = process.env.BACKEND_API_URL || 
    (isDevelopment ? 'http://localhost:5000' : 'https://d-wl.onrender.com');

  return {
    // Define environment variables that will be available in the app
    define: {
      'import.meta.env.BACKEND_API_URL': JSON.stringify(backendUrl),
    },
    server: {
      host: "::",
      port: parseInt(process.env.PORT || '8080'),
      // Proxy only in development mode
      ...(isDevelopment && {
        proxy: {
          '/api': {
            target: backendUrl,
            changeOrigin: true,
            secure: true,
          },
        },
      }),
    },
    plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
