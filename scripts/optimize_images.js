import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const workspaceRoot = process.cwd();

const targetFolders = [
  path.join(workspaceRoot, 'public'),
  path.join(workspaceRoot, 'public/products'),
  path.join(workspaceRoot, 'src/assets'),
  path.join(workspaceRoot, 'products 0.2'),
  path.join(workspaceRoot, 'new Product'),
  path.join(workspaceRoot, 'vital product')
];

async function optimizeFolder(dir) {
  if (!fs.existsSync(dir)) {
    console.log(`Folder does not exist, skipping: ${dir}`);
    return;
  }
  
  console.log(`Optimizing directory: ${dir}`);
  const files = fs.readdirSync(dir);
  let processed = 0;
  
  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    const filePath = path.join(dir, file);
    
    if (fs.statSync(filePath).isDirectory()) {
      continue;
    }
    
    if (ext === '.png' || ext === '.jpg' || ext === '.jpeg') {
      const baseName = path.basename(file, ext);
      const webpPath = path.join(dir, `${baseName}.webp`);
      
      console.log(`- Converting: ${file} -> ${baseName}.webp`);
      try {
        await sharp(filePath)
          .webp({ quality: 80, effort: 6 })
          .toFile(webpPath);
        processed++;
      } catch (err) {
        console.error(`  Error converting ${file}:`, err);
      }
    }
  }
  console.log(`Processed ${processed} images in ${dir}.\n`);
}

async function run() {
  console.log('=== VITAL AGRO IMAGE OPTIMIZATION ===');
  for (const folder of targetFolders) {
    await optimizeFolder(folder);
  }
  console.log('=== IMAGE OPTIMIZATION COMPLETE ===');
}

run();
