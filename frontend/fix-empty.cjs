const fs = require('fs');
const path = require('path');

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.tsx')) {
      const size = fs.statSync(fullPath).size;
      if (size === 0) {
        const name = path.basename(file, '.tsx');
        fs.writeFileSync(fullPath, `export default function ${name}() {\n  return <div className="p-4 border rounded m-2 bg-surface text-on-surface">${name}</div>;\n}\n`);
        console.log('Fixed', fullPath);
      }
    }
  }
}
walk('./src');
