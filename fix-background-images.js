// Script to fix backgroundImage urls that were incorrectly replaced
const fs = require('fs');
const path = require('path');

function getAllJsxFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !filePath.includes('node_modules')) {
      getAllJsxFiles(filePath, fileList);
    } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

const srcDir = path.join(__dirname, 'src');
const files = getAllJsxFiles(srcDir);

files.forEach(filePath => {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Fix style objects with src= instead of backgroundImage
    // Pattern: style={{ src="/images/...", ... }}
    const styleSrcPattern = /style=\{\{\s*src=["'](\/images\/[^"']+)["'],/g;
    
    content = content.replace(styleSrcPattern, (match, imagePath) => {
      return `style={{ backgroundImage: 'url("${imagePath}")',`;
    });
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Fixed backgroundImage in: ${path.relative(__dirname, filePath)}`);
    }
  } catch (error) {
    // Skip files that can't be read
  }
});

console.log('Done fixing background images!');

