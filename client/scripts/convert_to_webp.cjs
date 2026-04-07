const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const SRC_DIR = path.join(__dirname, '../src');

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  const list = fs.readdirSync(dir);
  for (let file of list) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      walk(filePath, files);
    } else {
      files.push(filePath);
    }
  }
  return files;
}

async function convertImages() {
  const files = walk(path.join(SRC_DIR, 'assets'));
  const pngFiles = files.filter((f) => f.endsWith('.png'));

  console.log(`Found ${pngFiles.length} PNG files. Converting to WebP...`);

  for (let file of pngFiles) {
    const webpFile = file.replace(/\.png$/, '.webp');
    try {
      await sharp(file)
        .webp({ quality: 80 }) // 80 is a good balance for compression
        .toFile(webpFile);

      console.log(
        `Converted: ${path.basename(file)} -> ${path.basename(webpFile)}`,
      );

      fs.unlinkSync(file);
    } catch (err) {
      console.error(`Error converting ${file}:`, err);
    }
  }
  console.log('Conversion complete!');
}

function updateReferences() {
  const files = walk(SRC_DIR);
  const codeFiles = files.filter((f) => f.match(/\.(ts|tsx|css|json)$/));

  let changedCount = 0;
  for (let file of codeFiles) {
    let content = fs.readFileSync(file, 'utf-8');
    let hasChanged = false;

    const quoteRegex = /(['"])(?!(?:https?:)?\/\/)([^'"]+)\.png(['"])/g;
    if (content.match(quoteRegex)) {
      content = content.replace(quoteRegex, '$1$2.webp$3');
      hasChanged = true;
    }

    const urlRegex = /url\((['"]?)(?!(?:https?:)?\/\/)([^'")]+)\.png\1\)/g;
    if (content.match(urlRegex)) {
      content = content.replace(urlRegex, 'url($1$2.webp$1)');
      hasChanged = true;
    }

    if (hasChanged) {
      fs.writeFileSync(file, content, 'utf-8');
      changedCount++;
    }
  }
  console.log(`Updated references in ${changedCount} files.`);
}

async function run() {
  await convertImages();
  updateReferences();
}

run();
