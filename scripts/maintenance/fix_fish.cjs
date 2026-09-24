const fs = require('fs');

let shop = fs.readFileSync('e:/PET SHOP/src/pages/Shop.jsx', 'utf-8');

// Fix fish subcategories
shop = shop.replace(/\{ name: 'Aquariums & Tanks', img: '[^']+' \}/g, "{ name: 'Aquariums & Tanks', img: '/images/fish/fish-tank.jpg' }");
shop = shop.replace(/\{ name: 'Water Care & Filtration', img: '[^']+' \}/g, "{ name: 'Water Care & Filtration', img: '/images/fish/fish-filter.jpg' }");
shop = shop.replace(/\{ name: 'Fish Food', img: '[^']+' \}/g, "{ name: 'Fish Food', img: '/images/fish/fish-food.jpg' }");
shop = shop.replace(/\{ name: 'Aquarium Lighting', img: '[^']+' \}/g, "{ name: 'Aquarium Lighting', img: 'https://images.unsplash.com/photo-1535591273668-578e31182c4f?q=80&w=800&auto=format&fit=crop' }");
shop = shop.replace(/\{ name: 'Plants & Décor', img: '[^']+' \}/g, "{ name: 'Plants & Décor', img: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?q=80&w=800&auto=format&fit=crop' }");

// Replace 'Other Accessories' specifically within the fish block.
let shopParts = shop.split('fish: {');
if (shopParts.length > 1) {
    shopParts[1] = shopParts[1].replace(/\{ name: 'Other Accessories', img: '[^']+' \}/, "{ name: 'Other Accessories', img: 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?q=80&w=800&auto=format&fit=crop' }");
    shop = shopParts.join('fish: {');
}

fs.writeFileSync('e:/PET SHOP/src/pages/Shop.jsx', shop);

const pool = [
  '/images/fish/fish-tank.jpg',
  '/images/fish/fish-filter.jpg',
  '/images/fish/fish-food.jpg',
  'https://images.unsplash.com/photo-1535591273668-578e31182c4f?q=80&w=800&auto=format&fit=crop', // corals
  'https://images.unsplash.com/photo-1501854140801-50d01698950b?q=80&w=800&auto=format&fit=crop', // plant
  'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?q=80&w=800&auto=format&fit=crop', // goldfish
  'https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=800&auto=format&fit=crop'  // pink fish
];

let products = JSON.parse(fs.readFileSync('e:/PET SHOP/server/data/products.json', 'utf-8'));
let count = 0;
for (let i=0; i<products.length; i++) {
  let c = products[i].category;
  if (c.includes('Fish') || ['Aquariums & Tanks', 'Water Care & Filtration', 'Aquarium Lighting', 'Plants & Décor'].includes(c)) {
    products[i].images = [pool[count % pool.length]];
    count++;
  }
}
fs.writeFileSync('e:/PET SHOP/server/data/products.json', JSON.stringify(products, null, 2));
console.log('Fixed fish images using local and verified Unsplash');
