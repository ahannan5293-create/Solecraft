const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const dir = path.join(__dirname, 'public/assets/images/shop');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.png'));

for (const file of files) {
  const filePath = path.join(dir, file);
  const data = fs.readFileSync(filePath);
  const png = PNG.sync.read(data);
  
  if (file === 'background.png') {
    const r = png.data[0];
    const g = png.data[1];
    const b = png.data[2];
    console.log(`background.png edge color: rgb(${r}, ${g}, ${b})`);
  }
  
  let minX = png.width, minY = png.height, maxX = 0, maxY = 0;
  for (let y = 0; y < png.height; y++) {
    for (let x = 0; x < png.width; x++) {
      const idx = (png.width * y + x) << 2;
      const alpha = png.data[idx + 3];
      if (alpha > 10) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  
  if (minX <= maxX) {
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    const cxPct = (cx / png.width * 100).toFixed(2);
    const cyPct = (cy / png.height * 100).toFixed(2);
    console.log(`${file} origin: ${cxPct}% ${cyPct}%`);
  }
}
