const fs = require('fs');

let shop = fs.readFileSync('e:/PET SHOP/src/pages/Shop.jsx', 'utf-8');

const getU = (id) => `https://images.unsplash.com/photo-${id}?q=80&w=800&auto=format&fit=crop`;

// Replace subcategories specifically within the pharmacy block.
let shopParts = shop.split('pharmacy: {');
if (shopParts.length > 1) {
    let block = shopParts[1];
    block = block.replace(/\{ name: 'All Veterinary', img: '[^']+' \}/g, "{ name: 'All Veterinary', img: '" + getU('1628771065518-0d82f1938462') + "' }");
    block = block.replace(/\{ name: 'Vitamins & Supplements', img: '[^']+' \}/g, "{ name: 'Vitamins & Supplements', img: '" + getU('1603398938378-e54eab446dde') + "' }");
    block = block.replace(/\{ name: 'First Aid & Healthcare', img: '[^']+' \}/g, "{ name: 'First Aid & Healthcare', img: '" + getU('1584308666744-24d5c474f2ae') + "' }");
    block = block.replace(/\{ name: 'Skin Care', img: '[^']+' \}/g, "{ name: 'Skin Care', img: '" + getU('1514888286974-6c03e2ca1dba') + "' }");
    block = block.replace(/\{ name: 'Joint Care', img: '[^']+' \}/g, "{ name: 'Joint Care', img: '" + getU('1555685812-4b943f1cb0eb') + "' }");
    block = block.replace(/\{ name: 'Digestive Care', img: '[^']+' \}/g, "{ name: 'Digestive Care', img: '" + getU('1544568100-847a948585b9') + "' }");
    // Some products say Digestive Health, some say Digestive Care, replace both if they exist
    block = block.replace(/\{ name: 'Digestive Health', img: '[^']+' \}/g, "{ name: 'Digestive Health', img: '" + getU('1544568100-847a948585b9') + "' }");
    block = block.replace(/\{ name: 'Other Accessories', img: '[^']+' \}/g, "{ name: 'Other Accessories', img: '" + getU('1517849845537-4d257902454a') + "' }");
    shopParts[1] = block;
    shop = shopParts.join('pharmacy: {');
}

fs.writeFileSync('e:/PET SHOP/src/pages/Shop.jsx', shop);

const pool = [
  getU('1628771065518-0d82f1938462'),
  getU('1584308666744-24d5c474f2ae'),
  getU('1603398938378-e54eab446dde'),
  getU('1555685812-4b943f1cb0eb'),
  getU('1544568100-847a948585b9'),
  getU('1517849845537-4d257902454a'),
  getU('1514888286974-6c03e2ca1dba'),
  getU('1583511655857-d19b40a7a54e') // One extra dog picture to have 8 unique
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
console.log('Fixed pharmacy images using verified Unsplash');
