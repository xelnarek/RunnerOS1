import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const required = [
  'package.json','capacitor.config.ts','index.html','src/App.tsx',
  'server/index.mjs','server/schema.sql','docker-compose.yml',
  'android/app/build.gradle','android/app/src/main/AndroidManifest.xml'
];
const missing = required.filter(f => !fs.existsSync(path.join(root,f)));
if (missing.length) {
  console.error('Missing required files:', missing.join(', '));
  process.exit(1);
}
const pkg = JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
const version = pkg.version;
const gradle = fs.readFileSync(path.join(root,'android/app/build.gradle'),'utf8');
const androidVersion = gradle.match(/versionName\s+'([^']+)'/)?.[1];
const code = Number(gradle.match(/versionCode\s+(\d+)/)?.[1] || 0);
if (androidVersion !== version) {
  console.error(`Version mismatch: package.json=${version}, Android=${androidVersion}`);
  process.exit(1);
}
if (code < 21) {
  console.error(`Android versionCode must be >=16, got ${code}`);
  process.exit(1);
}
const manifest = fs.readFileSync(path.join(root,'android/app/src/main/AndroidManifest.xml'),'utf8');
for (const token of ['FOREGROUND_SERVICE_LOCATION','ACCESS_FINE_LOCATION','android:foregroundServiceType="location"']) {
  if (!manifest.includes(token)) {
    console.error(`Android manifest missing: ${token}`);
    process.exit(1);
  }
}
console.log(JSON.stringify({ok:true,version,androidVersion,versionCode:code,requiredFiles:required.length},null,2));
