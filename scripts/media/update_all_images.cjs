const fs = require('fs');

const pools = {
  dogs: [
    '1548199973-03cce0bbc87b', '1517849845537-4d257902454a', '1583511655857-d19b40a7a54e',
    '1589924691995-400dc9ecc119', '1552053831-71594a27632d', '1535930891776-0c2dfb7fda1a',
    '1587300003388-59208cc962cb', '1601758228041-f3b2795255f1', '1588156979403-17631ee6858e',
    '1510771463146-e89e6e86560e', '1537151608804-ea2d1169f1cf', '1561037404-61cd46aa615b',
    '1534361960057-19889db9621e'
  ],
  cats: [
    '1514888286974-6c03e2ca1dba', '1513360371669-4adf3dd7dff8', '1533743983669-94fa5c4338ec',
    '1574158622682-e40e69881006', '1517331156700-3c241d2b4d83', '1495360010541-f48722b34f7d',
    '1543852786-1cf6624b9987', '1519052537078-e6302a4968d4', '1472491235688-ce69ae922574'
  ],
  birds: [
    '1452570053594-1b985d6ea890', '1480044965905-02098d419e96', '1551085254-e96b210db58a',
    '1584308666744-24d5c474f2ae', '1522869635100-9f4c5e86aa37', '1444464666168-e0d4d432320e',
    '1518055621406-03c73403d6d0', '1456082902841-3335005c3082', '1552728089-571eb144586f',
    '1580126780775-6032db0135d2'
  ],
  reptiles: [
    '1542625331-b72c87806d21', '1563281577-a7be47e20db9', '1548247416-ec66f4900b2e',
    '1515688594390-b649af70d282', '1516246843873-9e12c1eb716d', '1506161491740-109848135805'
  ],
  fish: [
    '1544551763-46a013bb70d5', '1524704654690-b56c05c78a00', '1522069169874-c58ec4b76be5',
    '1534062168393-2287c8008c2a', '1520314275095-2cc02d334dd1', '1538334460515-5e60803ee7c0'
  ],
  pharmacy: [
    '1584308666744-24d5c474f2ae', '1576201836106-db1758fd1c97', '1581888227599-779811939961',
    '1535930891776-0c2dfb7fda1a', '1552053831-71594a27632d', '1516734212186-a967f81ad0d7'
  ]
};

const catMap = {
  'Dog Food': 'dogs', 'Treats': 'dogs', 'Dog Beds & Cotes': 'dogs', 'Collars & Leashes': 'dogs', 'Supplements': 'dogs', 'Other Accessories': 'dogs',
  'Cat Food': 'cats', 'Beds & Scratchers': 'cats',
  'Bird Food': 'birds', 'Cages & Habitat': 'birds', 'Perches': 'birds', 'Toys': 'birds',
  'Reptile Food': 'reptiles', 'Terrariums': 'reptiles', 'Heating & Lighting': 'reptiles', 'Calcium & Supplements': 'reptiles', 'Décor': 'reptiles',
  'Aquariums & Tanks': 'fish', 'Water Care & Filtration': 'fish', 'Fish Food': 'fish', 'Aquarium Lighting': 'fish', 'Plants & Décor': 'fish',
  'All Veterinary': 'pharmacy', 'Vitamins & Supplements': 'pharmacy', 'First Aid & Healthcare': 'pharmacy', 'Skin Care': 'pharmacy', 'Joint Care': 'pharmacy', 'Digestive Health': 'pharmacy'
};

function getUnsplashUrl(poolName, index) {
  let pool = pools[poolName] || pools['dogs'];
  let id = pool[index % pool.length];
  return `https://images.unsplash.com/photo-${id}?q=80&w=800&auto=format&fit=crop`;
}

// 1. Update products.json
let products = JSON.parse(fs.readFileSync('e:/PET SHOP/server/data/products.json', 'utf-8'));
let counters = {};
for (let i=0; i<products.length; i++) {
  let c = products[i].category;
  let poolName = catMap[c];
  if (!poolName && c.includes('Bird')) poolName = 'birds';
  if (!poolName) poolName = 'dogs';
  
  if (!counters[poolName]) counters[poolName] = 0;
  products[i].images = [getUnsplashUrl(poolName, counters[poolName]++)];
}
fs.writeFileSync('e:/PET SHOP/server/data/products.json', JSON.stringify(products, null, 2));

// 2. Update Shop.jsx (replace all subcategory images with properly curated Unsplash URLs)
let shop = fs.readFileSync('e:/PET SHOP/src/pages/Shop.jsx', 'utf-8');

shop = shop.replace(/\{ name: 'Dog Food', img: '[^']+' \}/g, "{ name: 'Dog Food', img: '" + getUnsplashUrl('dogs', 0) + "' }");
shop = shop.replace(/\{ name: 'Treats', img: '[^']+' \}/g, "{ name: 'Treats', img: '" + getUnsplashUrl('dogs', 1) + "' }");
shop = shop.replace(/\{ name: 'Dog Beds & Cotes', img: '[^']+' \}/g, "{ name: 'Dog Beds & Cotes', img: '" + getUnsplashUrl('dogs', 2) + "' }");
shop = shop.replace(/\{ name: 'Collars & Leashes', img: '[^']+' \}/g, "{ name: 'Collars & Leashes', img: '" + getUnsplashUrl('dogs', 3) + "' }");
shop = shop.replace(/\{ name: 'Supplements', img: '[^']+' \}/g, "{ name: 'Supplements', img: '" + getUnsplashUrl('dogs', 4) + "' }");
shop = shop.replace(/\{ name: 'Other Accessories', img: '[^']+' \}/g, "{ name: 'Other Accessories', img: '" + getUnsplashUrl('dogs', 5) + "' }");

shop = shop.replace(/\{ name: 'Cat Food', img: '[^']+' \}/g, "{ name: 'Cat Food', img: '" + getUnsplashUrl('cats', 0) + "' }");
shop = shop.replace(/\{ name: 'Beds & Scratchers', img: '[^']+' \}/g, "{ name: 'Beds & Scratchers', img: '" + getUnsplashUrl('cats', 1) + "' }");

shop = shop.replace(/\{ name: 'Bird Food', img: '[^']+' \}/g, "{ name: 'Bird Food', img: '" + getUnsplashUrl('birds', 0) + "' }");
shop = shop.replace(/\{ name: 'Cages & Habitat', img: '[^']+' \}/g, "{ name: 'Cages & Habitat', img: '" + getUnsplashUrl('birds', 1) + "' }");
shop = shop.replace(/\{ name: 'Perches', img: '[^']+' \}/g, "{ name: 'Perches', img: '" + getUnsplashUrl('birds', 2) + "' }");
shop = shop.replace(/\{ name: 'Toys', img: '[^']+' \}/g, "{ name: 'Toys', img: '" + getUnsplashUrl('birds', 3) + "' }");
// For supplements, I'll manually replace because the replace string might not match perfectly if it was multiple places
shop = shop.replace(/\{ name: 'Supplements', img: '\/images\/birds\/bird-supplements\.jpg' \}/g, "{ name: 'Supplements', img: '" + getUnsplashUrl('birds', 4) + "' }");
shop = shop.replace(/\{ name: 'Other Accessories', img: '\/images\/birds\/bird-toys\.jpg' \}/g, "{ name: 'Other Accessories', img: '" + getUnsplashUrl('birds', 5) + "' }");

shop = shop.replace(/\{ name: 'Reptile Food', img: '[^']+' \}/g, "{ name: 'Reptile Food', img: '" + getUnsplashUrl('reptiles', 0) + "' }");
shop = shop.replace(/\{ name: 'Terrariums', img: '[^']+' \}/g, "{ name: 'Terrariums', img: '" + getUnsplashUrl('reptiles', 1) + "' }");
shop = shop.replace(/\{ name: 'Heating & Lighting', img: '[^']+' \}/g, "{ name: 'Heating & Lighting', img: '" + getUnsplashUrl('reptiles', 2) + "' }");
shop = shop.replace(/\{ name: 'Calcium & Supplements', img: '[^']+' \}/g, "{ name: 'Calcium & Supplements', img: '" + getUnsplashUrl('reptiles', 3) + "' }");
shop = shop.replace(/\{ name: 'Décor', img: '[^']+' \}/g, "{ name: 'Décor', img: '" + getUnsplashUrl('reptiles', 4) + "' }");

shop = shop.replace(/\{ name: 'Aquariums & Tanks', img: '[^']+' \}/g, "{ name: 'Aquariums & Tanks', img: '" + getUnsplashUrl('fish', 0) + "' }");
shop = shop.replace(/\{ name: 'Water Care & Filtration', img: '[^']+' \}/g, "{ name: 'Water Care & Filtration', img: '" + getUnsplashUrl('fish', 1) + "' }");
shop = shop.replace(/\{ name: 'Fish Food', img: '[^']+' \}/g, "{ name: 'Fish Food', img: '" + getUnsplashUrl('fish', 2) + "' }");
shop = shop.replace(/\{ name: 'Aquarium Lighting', img: '[^']+' \}/g, "{ name: 'Aquarium Lighting', img: '" + getUnsplashUrl('fish', 3) + "' }");
shop = shop.replace(/\{ name: 'Plants & Décor', img: '[^']+' \}/g, "{ name: 'Plants & Décor', img: '" + getUnsplashUrl('fish', 4) + "' }");

shop = shop.replace(/\{ name: 'All Veterinary', img: '[^']+' \}/g, "{ name: 'All Veterinary', img: '" + getUnsplashUrl('pharmacy', 0) + "' }");
shop = shop.replace(/\{ name: 'Vitamins & Supplements', img: '[^']+' \}/g, "{ name: 'Vitamins & Supplements', img: '" + getUnsplashUrl('pharmacy', 1) + "' }");
shop = shop.replace(/\{ name: 'First Aid & Healthcare', img: '[^']+' \}/g, "{ name: 'First Aid & Healthcare', img: '" + getUnsplashUrl('pharmacy', 2) + "' }");
shop = shop.replace(/\{ name: 'Skin Care', img: '[^']+' \}/g, "{ name: 'Skin Care', img: '" + getUnsplashUrl('pharmacy', 3) + "' }");
shop = shop.replace(/\{ name: 'Joint Care', img: '[^']+' \}/g, "{ name: 'Joint Care', img: '" + getUnsplashUrl('pharmacy', 4) + "' }");
shop = shop.replace(/\{ name: 'Digestive Health', img: '[^']+' \}/g, "{ name: 'Digestive Health', img: '" + getUnsplashUrl('pharmacy', 5) + "' }");

fs.writeFileSync('e:/PET SHOP/src/pages/Shop.jsx', shop);

console.log('All images updated securely to Unsplash');
