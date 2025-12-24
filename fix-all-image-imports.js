// Script to fix all image imports - convert to direct paths
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

const imageImportPattern = /import\s+(\w+)\s+from\s+['"](\/images\/[^'"]+)['"];?\n?/g;

files.forEach(filePath => {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    const matches = [...content.matchAll(imageImportPattern)];
    
    if (matches.length > 0) {
      matches.forEach(match => {
        const varName = match[1];
        const imagePath = match[2];
        
        // Remove the import statement
        content = content.replace(match[0], '');
        
        // Replace all usages of the variable with the direct path
        // Handle src={varName}, src={varName} with quotes, backgroundImage: `url(${varName})`, etc.
        const replacements = [
          // src={varName}
          new RegExp(`src=\\{${varName}\\}`, 'g'),
          // src={ varName }
          new RegExp(`src=\\{\\s*${varName}\\s*\\}`, 'g'),
          // backgroundImage: `url(${varName})`
          new RegExp(`backgroundImage:\\s*['\`]url\\(\\$\\{${varName}\\}\\)['\`]`, 'g'),
          // backgroundImage: `url(${ varName })`
          new RegExp(`backgroundImage:\\s*['\`]url\\(\\$\\{\\s*${varName}\\s*\\}\\)['\`]`, 'g'),
          // url(${varName})
          new RegExp(`url\\(\\$\\{${varName}\\}\\)`, 'g'),
          // url(${ varName })
          new RegExp(`url\\(\\$\\{\\s*${varName}\\s*\\}\\)`, 'g'),
        ];
        
        replacements.forEach(regex => {
          content = content.replace(regex, `src="${imagePath}"`);
        });
        
        // Also handle any remaining references to the variable
        const varUsageRegex = new RegExp(`\\{${varName}\\}`, 'g');
        if (content.match(varUsageRegex)) {
          content = content.replace(varUsageRegex, `"${imagePath}"`);
        }
      });
      
      if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Fixed: ${path.relative(__dirname, filePath)}`);
      }
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
});

console.log('Done fixing image imports!');

