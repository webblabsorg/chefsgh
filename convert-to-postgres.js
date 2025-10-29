/**
 * MySQL to Postgres Query Converter
 * Converts ? placeholders to $1, $2, $3... for Postgres
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const routesDir = path.join(__dirname, 'api', 'server', 'routes');
const servicesDir = path.join(__dirname, 'api', 'server', 'services');

function convertQueryPlaceholders(content) {
  // Convert pool.execute and pool.query calls with ? placeholders
  return content.replace(
    /(\bpool\.(execute|query)\s*\(\s*`[^`]*\?[^`]*`)/g,
    (match) => {
      let counter = 0;
      return match.replace(/\?/g, () => {
        counter++;
        return `$${counter}`;
      });
    }
  );
}

function convertFile(filePath) {
  console.log(`Converting: ${filePath}`);
  
  const content = fs.readFileSync(filePath, 'utf8');
  const converted = convertQueryPlaceholders(content);
  
  if (content !== converted) {
    // Create backup
    fs.writeFileSync(filePath + '.mysql-backup', content);
    // Write converted
    fs.writeFileSync(filePath, converted);
    console.log(`✓ Converted ${filePath}`);
    return true;
  } else {
    console.log(`- No changes needed for ${filePath}`);
    return false;
  }
}

function convertDirectory(dir) {
  if (!fs.existsSync(dir)) {
    console.log(`Directory not found: ${dir}`);
    return;
  }
  
  const files = fs.readdirSync(dir);
  let convertedCount = 0;
  
  for (const file of files) {
    if (file.endsWith('.js') && !file.includes('backup')) {
      const filePath = path.join(dir, file);
      if (convertFile(filePath)) {
        convertedCount++;
      }
    }
  }
  
  return convertedCount;
}

console.log('='.repeat(50));
console.log('MySQL to Postgres Converter');
console.log('='.repeat(50));
console.log('');

let totalConverted = 0;

console.log('Converting routes...');
totalConverted += convertDirectory(routesDir);

console.log('');
console.log('Converting services...');
totalConverted += convertDirectory(servicesDir);

console.log('');
console.log('='.repeat(50));
console.log(`✓ Conversion complete! ${totalConverted} files updated`);
console.log('Backups created with .mysql-backup extension');
console.log('='.repeat(50));
