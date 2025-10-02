// File: agent_rebuild_analysis.ts
// PURPOSE: SAFE ANALYSIS - Reports what the purge script WOULD delete (DRY-RUN MODE)
// This script DOES NOT delete anything - it only analyzes and reports

import fs from 'fs';
import path from 'path';

const WHITELIST = new Set([
  'src/lib',
  'core/',
  'deploy/',
  'glamor/',
  'docs/',
  'tests/',
  'LICENSE',
  'README.md',
  'LEGAL_FORTIFICATION.md',
  'nits_ultimate_legal.py',
  'nits_rdl_deployment.py',
  'rdl_deployment_pipeline.py',
  'tsconfig.json',
  'package.json',
  'runtime.config.json'
]);

// Normalize for consistent path checking
function normalizePath(p: string): string {
  return p.replace(/\\/g, '/').replace(/^\.\//, '');
}

function isWhitelisted(filepath: string): boolean {
  const clean = normalizePath(filepath);
  return Array.from(WHITELIST).some(w => clean.startsWith(normalizePath(w)));
}

interface AnalysisResult {
  filesToKeep: string[];
  filesToDelete: string[];
  dirsToDelete: string[];
  totalSize: number;
  warnings: string[];
}

function analyzeRecursively(dir: string, result: AnalysisResult): void {
  const entries = fs.readdirSync(dir);

  for (const name of entries) {
    const fullPath = path.join(dir, name);
    const relPath = normalizePath(path.relative(process.cwd(), fullPath));

    // Skip .git directory
    if (relPath.startsWith('.git')) {
      continue;
    }

    try {
      const stats = fs.lstatSync(fullPath);

      if (stats.isDirectory()) {
        analyzeRecursively(fullPath, result);

        // Check if directory would be removed
        if (fs.readdirSync(fullPath).length === 0 && !isWhitelisted(relPath)) {
          result.dirsToDelete.push(relPath);
        }
      } else {
        if (isWhitelisted(relPath)) {
          result.filesToKeep.push(relPath);
        } else {
          result.filesToDelete.push(relPath);
          result.totalSize += stats.size;
        }
      }
    } catch (err) {
      result.warnings.push(`Failed to process ${relPath}: ${err}`);
    }
  }
}

// 🎯 MAIN EXECUTION
console.log('🔍 NITS REPO PURGE ANALYSIS (DRY-RUN MODE)');
console.log('═══════════════════════════════════════════\n');
console.log('⚠️  THIS IS A SAFE ANALYSIS - NO FILES WILL BE DELETED\n');

const result: AnalysisResult = {
  filesToKeep: [],
  filesToDelete: [],
  dirsToDelete: [],
  totalSize: 0,
  warnings: []
};

analyzeRecursively(process.cwd(), result);

// Generate Report
console.log('📊 ANALYSIS RESULTS:');
console.log('═══════════════════════════════════════════\n');

console.log(`✅ Files to KEEP: ${result.filesToKeep.length}`);
console.log(`❌ Files to DELETE: ${result.filesToDelete.length}`);
console.log(`📁 Empty dirs to DELETE: ${result.dirsToDelete.length}`);
console.log(`💾 Total size to delete: ${(result.totalSize / 1024 / 1024).toFixed(2)} MB\n`);

console.log('🚨 CRITICAL WARNINGS:');
console.log('═══════════════════════════════════════════\n');

// Check for critical files that would be deleted
const criticalFiles = [
  'vite.config.ts',
  'tailwind.config.js',
  'index.html',
  'src/App.tsx',
  'src/main.tsx',
  'src/components',
  'src/services',
  'src/utils'
];

const criticalToDelete = result.filesToDelete.filter(f => 
  criticalFiles.some(cf => f.includes(cf))
);

if (criticalToDelete.length > 0) {
  console.log('⚠️  CRITICAL: The following essential files/folders would be DELETED:');
  criticalToDelete.forEach(f => console.log(`   - ${f}`));
  console.log('\n❌ This would BREAK the application build!\n');
}

console.log('\n📋 FILES TO KEEP (first 20):');
console.log('═══════════════════════════════════════════');
result.filesToKeep.slice(0, 20).forEach(f => console.log(`  ✅ ${f}`));
if (result.filesToKeep.length > 20) {
  console.log(`  ... and ${result.filesToKeep.length - 20} more`);
}

console.log('\n🗑️  FILES TO DELETE (first 20):');
console.log('═══════════════════════════════════════════');
result.filesToDelete.slice(0, 20).forEach(f => console.log(`  ❌ ${f}`));
if (result.filesToDelete.length > 20) {
  console.log(`  ... and ${result.filesToDelete.length - 20} more`);
}

if (result.warnings.length > 0) {
  console.log('\n⚠️  WARNINGS:');
  console.log('═══════════════════════════════════════════');
  result.warnings.forEach(w => console.log(`  ⚠️  ${w}`));
}

console.log('\n═══════════════════════════════════════════');
console.log('✅ ANALYSIS COMPLETE - NO FILES WERE MODIFIED');
console.log('═══════════════════════════════════════════\n');

console.log('📝 RECOMMENDATION:');
console.log('   This script has identified files that would be deleted.');
console.log('   However, many CRITICAL files would be removed, breaking the build.');
console.log('   Consider incremental refactoring instead of bulk deletion.\n');

// Export results for programmatic use
export { result, AnalysisResult };
