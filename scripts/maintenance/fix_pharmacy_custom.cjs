const fs = require('fs');

let shop = fs.readFileSync('e:/PET SHOP/src/pages/Shop.jsx', 'utf-8');

// Replace subcategories specifically within the pharmacy block using the new highly specific generated local images.
let shopParts = shop.split('pharmacy: {');
if (shopParts.length > 1) {
    let block = shopParts[1];
    block = block.replace(/\{ name: 'All Veterinary', img: '[^']+' \}/g, "{ name: 'All Veterinary', img: '/images/pharmacy/pharmacy-all.jpg' }");
    block = block.replace(/\{ name: 'Vitamins & Supplements', img: '[^']+' \}/g, "{ name: 'Vitamins & Supplements', img: '/images/pharmacy/pharmacy-vitamins.jpg' }");
    block = block.replace(/\{ name: 'First Aid & Healthcare', img: '[^']+' \}/g, "{ name: 'First Aid & Healthcare', img: '/images/pharmacy/pharmacy-firstaid.jpg' }");
    block = block.replace(/\{ name: 'Skin Care', img: '[^']+' \}/g, "{ name: 'Skin Care', img: '/images/pharmacy/pharmacy-skincare.jpg' }");
    block = block.replace(/\{ name: 'Joint Care', img: '[^']+' \}/g, "{ name: 'Joint Care', img: '/images/pharmacy/pharmacy-jointcare.jpg' }");
    block = block.replace(/\{ name: 'Digestive Care', img: '[^']+' \}/g, "{ name: 'Digestive Care', img: '/images/pharmacy/pharmacy-digestive.jpg' }");
    block = block.replace(/\{ name: 'Digestive Health', img: '[^']+' \}/g, "{ name: 'Digestive Health', img: '/images/pharmacy/pharmacy-digestive.jpg' }");
    block = block.replace(/\{ name: 'Other Accessories', img: '[^']+' \}/g, "{ name: 'Other Accessories', img: '/images/pharmacy/pharmacy-accessories.jpg' }");
    shopParts[1] = block;
    shop = shopParts.join('pharmacy: {');
}

fs.writeFileSync('e:/PET SHOP/src/pages/Shop.jsx', shop);

const pool = [
  '/images/pharmacy/pharmacy-all.jpg',
  '/images/pharmacy/pharmacy-vitamins.jpg',
  '/images/pharmacy/pharmacy-firstaid.jpg',
  '/images/pharmacy/pharmacy-skincare.jpg',
  '/images/pharmacy/pharmacy-jointcare.jpg',
  '/images/pharmacy/pharmacy-digestive.jpg',
  '/images/pharmacy/pharmacy-accessories.jpg'
];

let products = JSON.parse(fs.readFileSync('e:/PET SHOP/server/data/products.json', 'utf-8'));
let count = 0;
for (let i=0; i<products.length; i++) {
  let c = products[i].category;
  if (c.includes('Veterinary') || ['Vitamins & Supplements', 'First Aid & Healthcare', 'Skin Care', 'Joint Care', 'Digestive Health', 'Digestive Care'].includes(c)) {
    products[i].images = [pool[count % pool.length]];
    count++;
  }
}
fs.writeFileSync('e:/PET SHOP/server/data/products.json', JSON.stringify(products, null, 2));
console.log('Fixed pharmacy images using perfect generated local images');
