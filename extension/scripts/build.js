import fs from 'fs';
import { execSync } from 'child_process';
import archiver from 'archiver';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const extensionDir = path.join(__dirname, '..');
const distDir = path.join(extensionDir, 'dist');
const publicDir = path.join(extensionDir, '..', 'frontend', 'public');
const zipPath = path.join(publicDir, 'riskoracle-extension.zip');

console.log('Building Vite extension...');
execSync('npm run build', { cwd: extensionDir, stdio: 'inherit' });

console.log('Zipping dist folder...');
if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
}

const output = fs.createWriteStream(zipPath);
const archive = archiver('zip', { zlib: { level: 9 } });

output.on('close', () => {
    console.log(`Zip created: ${zipPath} (${archive.pointer()} total bytes)`);
});

archive.on('error', (err) => { throw err; });

archive.pipe(output);
archive.directory(distDir, false);
archive.finalize();
