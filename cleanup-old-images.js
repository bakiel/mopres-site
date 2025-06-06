const fs = require('fs');
const path = require('path');

// Old images to remove
const oldImages = [
  'Red_leopard_print_high_heels.jpg',
  'Leopard_print_high_heeled_shoes.jpg',
  'Red_high_heeled_shoe_1.jpg'
];

console.log('Cleaning up old product images...\n');

oldImages.forEach(image => {
  const imagePath = path.join(__dirname, 'public', image);
  
  if (fs.existsSync(imagePath)) {
    try {
      fs.unlinkSync(imagePath);
      console.log(`✓ Removed old image: ${image}`);
    } catch (error) {
      console.error(`✗ Error removing ${image}:`, error.message);
    }
  } else {
    console.log(`- Image not found (already removed?): ${image}`);
  }
});

console.log('\nCleanup complete!');
