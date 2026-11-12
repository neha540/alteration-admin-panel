import fs from 'node:fs';

['dist/_redirects', 'public/_redirects', '_redirects'].forEach((file) => {
  if (fs.existsSync(file)) {
    fs.unlinkSync(file);
    console.log('? Removed ' + file + ' to prevent Cloudflare redirect loop errors');
  }
});

if (fs.existsSync('dist/index.html')) {
  fs.copyFileSync('dist/index.html', 'dist/200.html');
  console.log('? Created dist/200.html for Cloudflare Pages SPA support');
}
