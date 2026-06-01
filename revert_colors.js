const fs = require('fs');
const path = require('path');

const files = [
  'c:/Users/dell/OneDrive/Desktop/ethara ai/inventory-management/frontend/src/components/Products.jsx',
  'c:/Users/dell/OneDrive/Desktop/ethara ai/inventory-management/frontend/src/components/Customers.jsx',
  'c:/Users/dell/OneDrive/Desktop/ethara ai/inventory-management/frontend/src/components/Orders.jsx',
  'c:/Users/dell/OneDrive/Desktop/ethara ai/inventory-management/frontend/src/components/Dashboard.jsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Revert dark blue text to white/cyan/pink for dark mode
  content = content.replace(/text-\[\#0f172a\]/g, 'text-white');
  content = content.replace(/text-\[\#1e3a8a\]\/70/g, 'text-white/60');
  content = content.replace(/text-\[\#1e3a8a\]\/60/g, 'text-white/50');
  content = content.replace(/text-\[\#1e3a8a\]/g, 'text-white/80');
  
  // Revert muddy white backgrounds to sleek glass backgrounds
  content = content.replace(/bg-white\/40/g, 'bg-white/5');
  content = content.replace(/bg-white\/60/g, 'bg-white/10');
  content = content.replace(/bg-\[\#1e3a8a\]\/5/g, 'bg-white/5');
  
  // Revert borders
  content = content.replace(/border-\[\#0f172a\]\/10/g, 'border-white/10');
  content = content.replace(/border-\[\#0f172a\]\/20/g, 'border-white/20');
  content = content.replace(/border-white\/50/g, 'border-white/10');
  content = content.replace(/border-\[\#1e3a8a\]\/20/g, 'border-white/20');
  content = content.replace(/border-\[\#1e3a8a\]\/10/g, 'border-white/10');

  // Placeholders
  content = content.replace(/placeholder-\[\#0f172a\]\/60/g, 'placeholder-white/50');

  // Fix table hovers
  content = content.replace(/hover:bg-\[\#1e3a8a\]\/5/g, 'hover:bg-white/10');
  content = content.replace(/hover:bg-\[\#1e3a8a\]\/10/g, 'hover:bg-white/20');
  content = content.replace(/hover:bg-white\/60/g, 'hover:bg-white/10');

  // Fix buttons in modals (that were made white/red but now on dark mode)
  content = content.replace(/text-red-600/g, 'text-pink-500');
  content = content.replace(/text-[#0f172a]/g, 'text-white'); // Catch any remaining
  
  fs.writeFileSync(file, content);
  console.log(`Updated ${file}`);
});
