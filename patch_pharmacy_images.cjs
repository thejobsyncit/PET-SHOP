const fs = require('fs');
const products = JSON.parse(fs.readFileSync('server/data/products.json'));
let lockId = 20;
products.forEach(p => {
  if (['Vitamins & Supplements', 'First Aid & Healthcare'].includes(p.category)) {
    p.images = [`https://loremflickr.com/800/800/veterinary,medicine?lock=${lockId++}`];
  }
});
fs.writeFileSync('server/data/products.json', JSON.stringify(products, null, 2));
console.log('Updated products.json with unique pharmacy images');
