// Copies the root funding.json (https://fundingjson.org) to public/ so it is
// served at https://shortener.dev/funding.json. Runs before build.
import { copyFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

copyFileSync(
  fileURLToPath(new URL('../../../funding.json', import.meta.url)),
  fileURLToPath(new URL('../public/funding.json', import.meta.url)),
);
console.log('funding: copied funding.json to public/');
