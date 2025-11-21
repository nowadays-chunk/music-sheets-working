const fs = require('fs');
const path = require('path');

const folderPath = path.join(__dirname, 'articles');

// Regex to match: \n\n## Songs.*
const regex = /\n\n## 3 Songs.*/g;

fs.readdir(folderPath, (err, files) => {
  if (err) {
    console.error("Error reading directory:", err);
    return;
  }

  files
    .filter(file => file.endsWith('.json'))
    .forEach(file => {
      const filePath = path.join(folderPath, file);

      try {
        let content = fs.readFileSync(filePath, 'utf8');

        let updated = content.replace(regex, '"}');

        const tempFile = filePath + '.tmp';

        // Write temp file first
        fs.writeFileSync(tempFile, updated, 'utf8');

        // Remove original
        fs.unlinkSync(filePath);

        // Rename temp file
        fs.renameSync(tempFile, filePath);

        console.log(`✔ Updated: ${file}`);
      } catch (e) {
        console.error(`❌ Error processing ${file}:`, e);
      }
    });
});
