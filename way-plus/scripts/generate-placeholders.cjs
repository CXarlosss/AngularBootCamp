const fs = require('fs');
const path = require('path');
const dir = path.join(process.cwd(), 'public/images/ways/webp');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

// A minimal 1x1 gray webp base64
const grayWebpBase64 = 'UklGRjQAAABXRUJQVlA4ICgAAAAwAQCdASoBAAEAAQAcJaQAA3AA/v3hOQA/w78YAAAAAABVWEJUAAAAA';
const grayWebpBuffer = Buffer.from(grayWebpBase64, 'base64');

let count = 0;
for (let i = 2; i <= 6; i++) {
  const p = path.join(dir, 'way_s1_w' + i + '.webp');
  if (!fs.existsSync(p)) { fs.writeFileSync(p, grayWebpBuffer); count++; }
}
for (let i = 2; i <= 29; i++) {
  const p = path.join(dir, 'way_s2_w' + i + '.webp');
  if (!fs.existsSync(p)) { fs.writeFileSync(p, grayWebpBuffer); count++; }
}
for (let i = 2; i <= 22; i++) {
  const p = path.join(dir, 'way_s3_w' + i + '.webp');
  if (!fs.existsSync(p)) { fs.writeFileSync(p, grayWebpBuffer); count++; }
}
console.log('Created ' + count + ' placeholder webp files');
