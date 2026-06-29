import fs from 'fs';
import { execSync } from 'child_process';

try {
  // Get list of staged files
  const stagedFiles = execSync('git diff --cached --name-only', { encoding: 'utf-8' })
    .split('\n')
    .map(file => file.trim())
    .filter(Boolean);

  let failed = false;

  stagedFiles.forEach(file => {
    // Audit Javascript/React files for raw console.log statements
    if (file.startsWith('src/') && (file.endsWith('.js') || file.endsWith('.jsx'))) {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf-8');
        if (content.includes('console.log')) {
          console.error(`❌ ERROR: File ${file} contains "console.log" statement. Please remove it before committing.`);
          failed = true;
        }
      }
    }
    // Audit image formats and sizes
    if (file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg')) {
      if (fs.existsSync(file)) {
        const stats = fs.statSync(file);
        if (stats.size > 200 * 1024) { // > 200KB uncompressed check
          console.warn(`⚠ WARNING: Staged file ${file} is an uncompressed image (>200KB). Consider using WebP format to maintain Lighthouse Mobile performance.`);
        }
      }
    }
  });

  if (failed) {
    process.exit(1);
  } else {
    console.info('✅ Staging file pre-commit audit passed successfully.');
    process.exit(0);
  }
} catch (error) {
  console.error('❌ Pre-commit audit script failed:', error.message);
  process.exit(1);
}
