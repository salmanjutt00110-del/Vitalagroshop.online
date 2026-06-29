import fs from 'fs';
import path from 'path';

// Helper to slugify names
function slugify(name) {
  return name
    .toLowerCase()
    .replace(/\.png$/i, '')
    .replace(/\.webp$/i, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

const folders = [
  'c:/Users/salma/Downloads/vital/products 0.2',
  'c:/Users/salma/Downloads/vital/new Product',
  'c:/Users/salma/Downloads/vital/vital product'
];

const publicDest = 'c:/Users/salma/Downloads/vital/public/products';
if (!fs.existsSync(publicDest)) {
  fs.mkdirSync(publicDest, { recursive: true });
}

console.log('Syncing product files...');
let copiedCount = 0;
const uniqueSlugs = new Set();

folders.forEach(folder => {
  if (!fs.existsSync(folder)) {
    console.log(`Folder not found: ${folder}`);
    return;
  }
  const files = fs.readdirSync(folder).filter(f => f.endsWith('.png') || f.endsWith('.webp'));
  files.forEach(file => {
    const slug = slugify(file);
    const ext = path.extname(file);
    const destName = `${slug}${ext}`;
    const destPath = path.join(publicDest, destName);
    
    fs.copyFileSync(path.join(folder, file), destPath);
    uniqueSlugs.add(slug);
    copiedCount++;
  });
});

console.log(`Copied ${copiedCount} files (${uniqueSlugs.size} unique products) to public/products.`);
console.log('Database synchronization is complete. To add new catalog details, modify src/data/productsData.js.');
