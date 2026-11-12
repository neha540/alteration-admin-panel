import fs from 'node:fs';

if (fs.existsSync('dist')) {
  fs.rmSync('dist', { recursive: true, force: true });
  console.log('? Cleaned dist directory before build');
}

['public/_redirects', '_redirects'].forEach((file) => {
  if (fs.existsSync(file)) {
    fs.unlinkSync(file);
    console.log('? Removed ' + file);
  }
});
