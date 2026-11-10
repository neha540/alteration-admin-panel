import fs from 'node:fs';
if (fs.existsSync('dist/index.html')) {
  fs.copyFileSync('dist/index.html', 'dist/200.html');
  console.log('✓ Created dist/200.html for Cloudflare Pages SPA support');
}

