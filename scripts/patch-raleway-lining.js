const fs = require('fs');
const path = require('path');

function recomputeChecksum(buf, offset, length) {
  let sum = 0;
  const n = Math.ceil(length / 4);
  for (let i = 0; i < n; i++) {
    const o = offset + i * 4;
    const val = o + 4 <= buf.length ? buf.readUInt32BE(o) : (
      ((buf[o] || 0) << 24) |
      ((buf[o + 1] || 0) << 16) |
      ((buf[o + 2] || 0) << 8) |
      (buf[o + 3] || 0)
    ) >>> 0;
    sum = (sum + val) >>> 0;
  }
  return sum;
}

function patchFontToLining(inputBuf) {
  const buf = Buffer.from(inputBuf);
  const numTables = buf.readUInt16BE(4);
  let cmapOffset = 0, cmapLen = 0, cmapDirIdx = -1;
  let headOffset = 0, headLen = 0, headDirIdx = -1;

  for (let i = 0; i < numTables; i++) {
    const tag = buf.toString('ascii', 12 + i * 16, 12 + i * 16 + 4);
    if (tag === 'cmap') {
      cmapOffset = buf.readUInt32BE(12 + i * 16 + 8);
      cmapLen = buf.readUInt32BE(12 + i * 16 + 12);
      cmapDirIdx = i;
    }
    if (tag === 'head') {
      headOffset = buf.readUInt32BE(12 + i * 16 + 8);
      headLen = buf.readUInt32BE(12 + i * 16 + 12);
      headDirIdx = i;
    }
  }

  const subOffset = cmapOffset + buf.readUInt32BE(cmapOffset + 4 + 4);
  const segCount = buf.readUInt16BE(subOffset + 6) / 2;
  const endCodeOffset = subOffset + 14;
  const startCodeOffset = endCodeOffset + segCount * 2 + 2;
  const idDeltaOffset = startCodeOffset + segCount * 2;

  let segIndex = -1;
  for (let s = 0; s < segCount; s++) {
    const start = buf.readUInt16BE(startCodeOffset + s * 2);
    const end = buf.readUInt16BE(endCodeOffset + s * 2);
    if (start <= 0x30 && end >= 0x39) {
      segIndex = s;
      break;
    }
  }

  if (segIndex === -1) {
    throw new Error('Digits segment not found');
  }

  const currentDelta = buf.readInt16BE(idDeltaOffset + segIndex * 2);
  // Shift delta by 10 to point to .lf glyphs (lining figures)
  const targetDelta = currentDelta + 10;
  buf.writeInt16BE(targetDelta, idDeltaOffset + segIndex * 2);

  // Update cmap checksum
  const newCmapChecksum = recomputeChecksum(buf, cmapOffset, cmapLen);
  buf.writeUInt32BE(newCmapChecksum, 12 + cmapDirIdx * 16 + 4);

  // Update head checksum
  buf.writeUInt32BE(0, headOffset + 8);
  const newHeadChecksum = recomputeChecksum(buf, headOffset, headLen);
  buf.writeUInt32BE(newHeadChecksum, 12 + headDirIdx * 16 + 4);

  const totalSum = recomputeChecksum(buf, 0, buf.length);
  const checkSumAdjustment = (0xB1B0AFBA - totalSum) >>> 0;
  buf.writeUInt32BE(checkSumAdjustment, headOffset + 8);

  return buf;
}

const fontNames = [
  'Raleway-Regular.ttf',
  'Raleway-Medium.ttf',
  'Raleway-SemiBold.ttf',
  'Raleway-Bold.ttf',
  'Raleway-ExtraBold.ttf',
];

const targetDirs = [
  path.join(__dirname, '..', 'src', 'assets', 'fonts'),
  path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'assets', 'fonts'),
];

for (const name of fontNames) {
  const srcPath = path.join(__dirname, '..', 'src', 'assets', 'fonts', name);
  const orig = fs.readFileSync(srcPath);
  const patched = patchFontToLining(orig);

  for (const dir of targetDirs) {
    const destPath = path.join(dir, name);
    fs.writeFileSync(destPath, patched);
    console.log(`Updated: ${destPath}`);
  }
}
console.log('All Raleway fonts successfully converted to Lining Numerals!');
