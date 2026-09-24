const fs = require('fs');

let shop = fs.readFileSync('e:/PET SHOP/src/pages/Shop.jsx', 'utf-8');
shop = shop.replace(/\{ name: 'Bird Food', img: '[^']+' \}/g, "{ name: 'Bird Food', img: '/images/birds/bird-food.jpg' }");
shop = shop.replace(/\{ name: 'Cages & Habitat', img: '[^']+' \}/g, "{ name: 'Cages & Habitat', img: '/images/birds/bird-cage.jpg' }");
shop = shop.replace(/\{ name: 'Perches', img: '[^']+' \}/g, "{ name: 'Perches', img: '/images/birds/bird-perch.jpg' }");
shop = shop.replace(/\{ name: 'Toys', img: '[^']+' \}/g, "{ name: 'Toys', img: '/images/birds/bird-toys.jpg' }");
shop = shop.replace(/\{ name: 'Supplements', img: '[^']+' \}/g, "{ name: 'Supplements', img: '/images/birds/bird-supplements.jpg' }");
shop = shop.replace(/\{ name: 'Other Accessories', img: '[^']+' \}/g, "{ name: 'Other Accessories', img: 'https://images.unsplash.com/photo-1452570053594-1b985d6ea890?q=80&w=800&auto=format&fit=crop' }");
fs.writeFileSync('e:/PET SHOP/src/pages/Shop.jsx', shop);

const pool = [
  '/images/birds/bird-food.jpg',
  '/images/birds/bird-cage.jpg',
  '/images/birds/bird-perch.jpg',
  '/images/birds/bird-toys.jpg',
  '/images/birds/bird-supplements.jpg',
  'https://images.unsplash.com/photo-1452570053594-1b985d6ea890?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1480044965905-02098d419e96?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1551085254-e96b210db58a?q=80&w=800&auto=format&fit=crop'
];

let products = JSON.parse(fs.readFileSync('e:/PET SHOP/server/data/products.json', 'utf-8'));
let count = 0;
for (let i=0; i<products.length; i++) {
  let c = products[i].category;
  if (c.includes('Bird') || ['Cages & Habitat', 'Perches', 'Toys', 'Supplements'].includes(c)) {
    products[i].images = [pool[count % pool.length]];
    count++;
  }
}
fs.writeFileSync('e:/PET SHOP/server/data/products.json', JSON.stringify(products, null, 2));
console.log('Fixed bird images using local and verified Unsplash');
