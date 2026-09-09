const fs = require('fs');

const pools = {
  dogs: [
    '1548199973-03cce0bbc87b', '1517849845537-4d257902454a', '1583511655857-d19b40a7a54e',
    '1589924691995-400dc9ecc119', '1552053831-71594a27632d', '1535930891776-0c2dfb7fda1a',
    '1587300003388-59208cc962cb', '1601758228041-f3b2795255f1', '1588156979403-17631ee6858e'
  ],
  cats: [
    '1514888286974-6c03e2ca1dba', '1513360371669-4adf3dd7dff8', '1533743983669-94fa5c4338ec',
    '1574158622682-e40e69881006', '1517331156700-3c241d2b4d83', '1495360010541-f48722b34f7d'
  ],
  birds: [
    '1452570053594-1b985d6ea890', '1480044965905-02098d419e96', '1551085254-e96b210db58a',
    '1584308666744-24d5c474f2ae', '1522869635100-9f4c5e86aa37', '1444464666168-e0d4d432320e',
    '1518055621406-03c73403d6d0', '1456082902841-3335005c3082'
  ],
  reptiles: [
    '1542625331-b72c87806d21', '1563281577-a7be47e20db9', '1548247416-ec66f4900b2e',
    '1515688594390-b649af70d282'
  ],
  fish: [
    '1544551763-46a013bb70d5', '1524704654690-b56c05c78a00', '1522069169874-c58ec4b76be5'
  ],
  pharmacy: [
    '1584308666744-24d5c474f2ae', '1576201836106-db1758fd1c97', '1581888227599-779811939961'
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

let products = JSON.parse(fs.readFileSync('e:/PET SHOP/server/data/products.json', 'utf-8'));
let counters = {};
for (let i=0; i<products.length; i++) {
  let c = products[i].category;
  let poolName = catMap[c];
  if (!poolName && c.includes('Bird')) poolName = 'birds';
  if (!poolName) poolName = 'dogs'; // fallback
  
  if (!counters[poolName]) counters[poolName] = 0;
  let id = pools[poolName][counters[poolName] % pools[poolName].length];
  products[i].images = [`https://images.unsplash.com/photo-${id}?q=80&w=800&auto=format&fit=crop`];
  counters[poolName]++;
}
fs.writeFileSync('e:/PET SHOP/server/data/products.json', JSON.stringify(products, null, 2));
console.log('Fixed products.json images');
