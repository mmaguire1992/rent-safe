// Script to add 'use client' to all components that need it
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const componentsDir = path.join(__dirname, 'src', 'components');

function getAllJsxFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      getAllJsxFiles(filePath, fileList);
    } else if (file.endsWith('.jsx')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

const files = getAllJsxFiles(componentsDir);
const hookPattern = /useState|useEffect|useNavigate|useParams|useSearchParams|useLocation|useRouter|usePathname|useRef/;

files.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Check if it uses hooks but doesn't have 'use client'
  if (hookPattern.test(content) && !content.startsWith("'use client'")) {
    content = "'use client'\n\n" + content;
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Added 'use client' to: ${path.relative(__dirname, filePath)}`);
  }
});

console.log('Done!');

