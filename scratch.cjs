const Jimp = require('jimp');
const fs = require('fs');

async function analyzeLogo() {
  try {
    const image = await Jimp.read('./public/Goindaicab logo.png');
    const colorCounts = {};
    
    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
      const red   = this.bitmap.data[idx + 0];
      const green = this.bitmap.data[idx + 1];
      const blue  = this.bitmap.data[idx + 2];
      const alpha = this.bitmap.data[idx + 3];

      // Ignore fully transparent pixels
      if (alpha < 128) return;
      
      // Ignore near white pixels
      if (red > 240 && green > 240 && blue > 240) return;
      
      // Ignore near black pixels
      if (red < 15 && green < 15 && blue < 15) return;

      // Group colors roughly by rounding to nearest 10
      const r = Math.round(red / 10) * 10;
      const g = Math.round(green / 10) * 10;
      const b = Math.round(blue / 10) * 10;
      
      const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
      colorCounts[hex] = (colorCounts[hex] || 0) + 1;
    });

    const sortedColors = Object.entries(colorCounts).sort((a, b) => b[1] - a[1]);
    console.log("Top colors found:");
    for (let i = 0; i < 5 && i < sortedColors.length; i++) {
      console.log(sortedColors[i][0], " - ", sortedColors[i][1], "pixels");
    }
  } catch (err) {
    console.error(err);
  }
}

analyzeLogo();
