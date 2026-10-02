const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'public/assets/images/shop');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.png'));

for (const file of files) {
  const filePath = path.join(dir, file);
  const buffer = fs.readFileSync(filePath);
  // Read basic PNG dimensions from IHDR chunk
  if (buffer.toString('ascii', 1, 4) === 'PNG') {
    const width = buffer.readUInt32BE(16);
    const height = buffer.readUInt32BE(20);
    console.log(`${file}: ${width}x${height}`);
  }
}
