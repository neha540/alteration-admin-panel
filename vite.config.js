import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
export default defineConfig({
  build: {
    emptyOutDir: true,
  },
  plugins: [
    tailwindcss(),
    react(),
    {
      name: 'cloudflare-cleaner-plugin',
      buildStart() {
        ['public/_redirects', '_redirects'].forEach(f => {
          const p = path.resolve(__dirname, f);
          if (fs.existsSync(p)) {
            try { fs.unlinkSync(p); } catch {}
          }
        });
      },
      closeBundle() {
        const distDir = path.resolve(__dirname, 'dist');
        const redirectsFile = path.join(distDir, '_redirects');
        if (fs.existsSync(redirectsFile)) {
          try {
            fs.unlinkSync(redirectsFile);
            console.log('? Successfully deleted dist/_redirects to avoid Cloudflare loop');
          } catch (e) {
            console.error('Failed to unlink dist/_redirects:', e);
          }
        }
        const indexHtml = path.join(distDir, 'index.html');
        const fallback200 = path.join(distDir, '200.html');
        if (fs.existsSync(indexHtml)) {
          try {
            fs.copyFileSync(indexHtml, fallback200);
            console.log('? Generated dist/200.html for Cloudflare SPA fallback');
          } catch {}
        }
      }
    }
  ],
})
