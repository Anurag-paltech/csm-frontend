import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';

const target = process.env.VITE_DEV_API_PROXY ?? 'http://localhost:8000';

// A browser navigation asks for HTML; Axios data calls do not. For segments the
// BFF shares with SPA routes we proxy only the data calls and let navigations
// fall through to index.html + the client router.
const passNavigationsToSpa = (req) =>
  req.headers.accept?.includes('text/html') ? '/index.html' : undefined;

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  server: {
    port: 5173,
    // Forward backend calls in dev so the app shares the backend's origin
    // (needed for the session cookies) and avoids CORS. The BFF serves
    // everything at root; add new segments to whichever group they belong to.
    proxy: {
      // BFF-only segments (OAuth navigations + JSON) — always proxy. Only add a
      // segment here once the frontend actually calls it; an unused entry lets
      // a stale browser navigation hit the backend instead of the SPA's 404.
      // (`/claims` is in the backend contract but has no consumer yet —
      // features/claims was removed — so it's deliberately not listed.)
      '^/(auth|me|health|lookups|srt)(/|$)': { target, changeOrigin: true },
      // `/admin` collides with the SPA route of the same name — proxy the data
      // calls, pass browser navigations to the SPA.
      '^/admin(/|$)': {
        target,
        changeOrigin: true,
        bypass: passNavigationsToSpa,
      },
    },
  },
});
