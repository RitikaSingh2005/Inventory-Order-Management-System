const fs = require('fs');
const path = require('path');
const dir = 'c:/Users/dell/OneDrive/Desktop/ethara ai/inventory-management/frontend/src/components';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx'));
let hasError = false;
files.forEach(f => {
  const code = fs.readFileSync(path.join(dir, f), 'utf-8');
  const importMatch = code.match(/import\s+\{[^}]+\}\s+from\s+['"]react-icons\/fi['"]/);
  const importedIcons = importMatch ? importMatch[0].match(/Fi[A-Za-z0-9]+/g) || [] : [];
  
  const usedIcons = [...code.matchAll(/<(Fi[A-Za-z0-9]+)/g)].map(m => m[1]);
  
  usedIcons.forEach(icon => {
    if (!importedIcons.includes(icon)) {
      console.log('MISSING in', f, ':', icon);
      hasError = true;
    }
  });
});
if (!hasError) console.log('ALL ICONS IMPORTED SUCCESSFULLY');
