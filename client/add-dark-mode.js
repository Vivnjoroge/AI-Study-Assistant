import fs from 'fs';
import path from 'path';

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
  });
}

walk('./src', (filePath) => {
  if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;

  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Backgrounds
  content = content.replace(/bg-\[#0a0a14\]/g, 'bg-slate-50 dark:bg-[#0a0a14]');
  content = content.replace(/bg-\[#0d0d1a\]/g, 'bg-white dark:bg-[#0d0d1a]');
  content = content.replace(/bg-\[#0f0f1a\]\/80/g, 'bg-white/80 dark:bg-[#0f0f1a]/80');
  content = content.replace(/bg-\[#13131f\]/g, 'bg-white dark:bg-[#13131f]');
  
  // Base borders
  content = content.replace(/border-white\/10/g, 'border-slate-200 dark:border-white/10');
  content = content.replace(/border-white\/20/g, 'border-slate-300 dark:border-white/20');
  
  // Specific overlays and backgrounds
  content = content.replace(/bg-white\/5/g, 'bg-white shadow-sm dark:shadow-none dark:bg-white/5');
  content = content.replace(/bg-white\/\[0\.07\]/g, 'bg-slate-50 dark:bg-white/[0.07]');
  content = content.replace(/bg-black\/30/g, 'bg-slate-100 dark:bg-black/30');
  content = content.replace(/bg-black\/60/g, 'bg-slate-900/40 dark:bg-black/60');
  
  // Text colors (only when not obviously inside a primary button, which should stay white)
  // Usually buttons have "text-white" near "bg-violet-600".
  // Let's replace standalone text-white with text-slate-900 dark:text-white
  // But to be safe, only replace text-white if it's not near bg-violet
  // Rather, we map "text-white" -> "text-slate-900 dark:text-white"
  // and "text-slate-..." mapped up one notch for light mode
  content = content.replace(/text-slate-200/g, 'text-slate-700 dark:text-slate-200');
  content = content.replace(/text-slate-300/g, 'text-slate-600 dark:text-slate-300');
  content = content.replace(/text-slate-400/g, 'text-slate-500 dark:text-slate-400');
  
  // Fix text-white safely: if there's "text-white" and NOT "bg-violet", etc. This is tricky.
  // Instead of auto-replacing text-white globally, let's just make body text dark in light mode,
  // and explicit "text-white" elements will remain white unless overridden by text-slate-900.
  // We can just add text-slate-900 dark:text-white to main blocks.
  
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
});
