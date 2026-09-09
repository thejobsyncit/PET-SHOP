const fs = require('fs');

let shop = fs.readFileSync('e:/PET SHOP/src/pages/Shop.jsx', 'utf-8');

// Fix reptiles subcategories
shop = shop.replace(/\{ name: 'Reptile Food', img: '[^']+' \}/g, "{ name: 'Reptile Food', img: '/images/reptiles/reptile-food.jpg' }");
shop = shop.replace(/\{ name: 'Terrariums', img: '[^']+' \}/g, "{ name: 'Terrariums', img: '/images/reptiles/reptile-terrarium.jpg' }");
shop = shop.replace(/\{ name: 'Heating & Lighting', img: '[^']+' \}/g, "{ name: 'Heating & Lighting', img: '/images/reptiles/reptile-heating.jpg' }");
shop = shop.replace(/\{ name: 'Calcium & Supplements', img: '[^']+' \}/g, "{ name: 'Calcium & Supplements', img: '/images/reptiles/reptile-supplements.jpg' }");
shop = shop.replace(/\{ name: 'Décor', img: '[^']+' \}/g, "{ name: 'Décor', img: '/images/reptiles/reptile-decor.jpg' }");

// Because 'Other Accessories' exists in Birds too, we only want to replace the one in Reptiles!
// We'll replace it specifically within the reptiles block.
let shopParts = shop.split('reptiles: {');
if (shopParts.length > 1) {
    shopParts[1] = shopParts[1].replace(/\{ name: 'Other Accessories', img: '[^']+' \}/, "{ name: 'Other Accessories', img: 'https://images.unsplash.com/photo-1542625331-b72c87806d21?q=80&w=800&auto=format&fit=crop' }");
    shop = shopParts.join('reptiles: {');
}

fs.writeFileSync('e:/PET SHOP/src/pages/Shop.jsx', shop);

const pool = [
  '/images/reptiles/reptile-food.jpg',
  '/images/reptiles/reptile-terrarium.jpg',
  '/images/reptiles/reptile-heating.jpg',
  '/images/reptiles/reptile-supplements.jpg',
  '/images/reptiles/reptile-decor.jpg',
  'https://images.unsplash.com/photo-1542625331-b72c87806d21?q=80&w=800&auto=format&fit=crop', // chameleon
  'https://images.unsplash.com/photo-1563281577-a7be47e20db9?q=80&w=800&auto=format&fit=crop'  // snake
];

let products = JSON.parse(fs.readFileSync('e:/PET SHOP/server/data/products.json', 'utf-8'));
let count = 0;
for (let i=0; i<products.length; i++) {
  let c = products[i].category;
  if (c.includes('Reptile') || ['Terrariums', 'Heating & Lighting', 'Calcium & Supplements', 'Décor'].includes(c)) {
    products[i].images = [pool[count % pool.length]];
    count++;
  }
}
fs.writeFileSync('e:/PET SHOP/server/data/products.json', JSON.stringify(products, null, 2));
console.log('Fixed reptile images using local and verified Unsplash');
