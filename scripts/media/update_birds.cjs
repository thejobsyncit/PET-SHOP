const fs = require('fs');

let shop = fs.readFileSync('e:/PET SHOP/src/pages/Shop.jsx', 'utf-8');
shop = shop.replace(/\{ name: 'Bird Food', img: '[^']+' \}/g, "{ name: 'Bird Food', img: 'https://loremflickr.com/800/800/bird,seeds?lock=200' }");
shop = shop.replace(/\{ name: 'Cages & Habitat', img: '[^']+' \}/g, "{ name: 'Cages & Habitat', img: 'https://loremflickr.com/800/800/birdcage?lock=201' }");
shop = shop.replace(/\{ name: 'Perches', img: '[^']+' \}/g, "{ name: 'Perches', img: 'https://loremflickr.com/800/800/parrot,branch?lock=202' }");
shop = shop.replace(/\{ name: 'Toys', img: '[^']+' \}/g, "{ name: 'Toys', img: 'https://loremflickr.com/800/800/bird,toy?lock=203' }");
shop = shop.replace(/\{ name: 'Supplements', img: '[^']+' \}/g, "{ name: 'Supplements', img: 'https://loremflickr.com/800/800/bird,health?lock=204' }");
shop = shop.replace(/\{ name: 'Other Accessories', img: '[^']+' \}/g, "{ name: 'Other Accessories', img: 'https://loremflickr.com/800/800/macaw?lock=205' }");
fs.writeFileSync('e:/PET SHOP/src/pages/Shop.jsx', shop);

let products = JSON.parse(fs.readFileSync('e:/PET SHOP/server/data/products.json', 'utf-8'));
let birdKeywords = ['macaw', 'parrot', 'cockatiel', 'canary', 'budgie', 'lovebird', 'finch', 'cockatoo'];
let birdCount = 0;
for (let i=0; i<products.length; i++) {
  if (['Bird Food', 'Cages & Habitat', 'Perches', 'Toys', 'Supplements'].includes(products[i].category) || products[i].category.includes('Bird')) {
    let kw = birdKeywords[birdCount % birdKeywords.length];
    products[i].images = ['https://loremflickr.com/800/800/' + kw + '?lock=' + (300 + i)];
    birdCount++;
  }
}
fs.writeFileSync('e:/PET SHOP/server/data/products.json', JSON.stringify(products, null, 2));
console.log('Fixed bird images in Shop.jsx and products.json');
