const fs = require('fs');
const path = require('path');

// Curated list of high-quality, unique Unsplash photo IDs by category
const imageBank = {
  dogs: [
    '1544568100-eba616a6ce76', '1583511655857-d19b40a7a54e', '1548199973-03cce0bbc87b', '1517849845537-4d257902454a',
    '1534361960057-19889db9621e', '1601758228041-f3b2795255f1', '1587300003388-59208cc962cb', '1552053831-71594a27632d',
    '1535930891776-0c2dfb7fda1a', '1589924691995-400dc9ecc119'
  ],
  cats: [
    '1514888286974-6c03e2ca1dba', '1513360371669-4adf3dd7dff8', '1533743983669-94fa5c4338ec', '1574158622682-e40e69881006',
    '1517331156700-3c241d2b4d83', '1573865526739-10659fec78a5', '1495360010541-f48722b34f7d', '1519052537078-e6302a4968d4'
  ],
  birds: [
    '1452570053594-1b985d6ea890', '1602058376483-e8eeeb63b320', '1555685812-4b943f1cb0eb', '1522276498395-f4f68f7f8454',
    '1444464666168-49b62d881512', '1480044965905-02098d419e96', '1611096739987-a0f19c9228d5', '1542385151-efd9000785a0'
  ],
  reptiles: [
    '1542625331-b72c87806d21', '1522069169874-c58ec4b76be5', '1472645977521-95bbf4f0a748', '1627398225058-20d3de3ef908',
    '1580226955007-88eb7c71d3d6'
  ],
  fish: [
    '1544551763-46a013bb70d5', '1535591273668-578e3111ea3c', '1524704654690-b56c05c78a00', '1582967788606-a171c1080cb0'
  ],
  vet: [
    '1584813470769-d758f2d59ab5', '1628009368231-7718fc89829e', '1606425134789-5f21272fc4d6', '1629909613654-20e3650275cc',
    '1583337130417-3346a1be7dee'
  ],
  grooming: [
    '1516734212186-a967f81ad0d7', '1583511655857-d19b40a7a54e', '1587300003388-59208cc962cb'
  ],
  avatars: [
    '1472099645785-5658abf4ff4e', '1500648767791-00dcc994a43e', '1534528741775-53994a69daeb', '1507003211169-0a1dd7228f2d',
    '1580489944761-15a19d654956', '1633332755192-727a05c4013d', '1544005313-94ddf0286df2', '1438761681033-6461ffad8d80'
  ]
};

// Track usage to ensure uniqueness where possible
const usageCount = {};
const getUniqueImage = (category) => {
  const bank = imageBank[category] || imageBank['dogs'];
  // Find least used
  let leastUsed = bank[0];
  let minCount = usageCount[leastUsed] || 0;
  
  for (const id of bank) {
    const c = usageCount[id] || 0;
    if (c < minCount) {
      minCount = c;
      leastUsed = id;
    }
  }
  usageCount[leastUsed] = (usageCount[leastUsed] || 0) + 1;
  return `https://images.unsplash.com/photo-${leastUsed}?q=80&w=800&auto=format&fit=crop`;
};

// Regex to find Unsplash image URLs
const imgRegex = /https:\/\/images\.unsplash\.com\/photo-[a-zA-Z0-9\-]+(\?[a-zA-Z0-9=&]+)?/g;

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let match;
  let modified = false;

  const newContent = content.replace(imgRegex, (match) => {
    modified = true;
    // Context inference
    let category = 'dogs';
    if (filePath.toLowerCase().includes('cat') || content.substring(Math.max(0, content.indexOf(match) - 50), content.indexOf(match)).toLowerCase().includes('cat')) category = 'cats';
    else if (filePath.toLowerCase().includes('bird') || content.substring(Math.max(0, content.indexOf(match) - 50), content.indexOf(match)).toLowerCase().includes('bird')) category = 'birds';
    else if (filePath.toLowerCase().includes('reptile') || content.substring(Math.max(0, content.indexOf(match) - 50), content.indexOf(match)).toLowerCase().includes('reptile')) category = 'reptiles';
    else if (filePath.toLowerCase().includes('fish') || content.substring(Math.max(0, content.indexOf(match) - 50), content.indexOf(match)).toLowerCase().includes('fish')) category = 'fish';
    else if (filePath.toLowerCase().includes('vet') || content.substring(Math.max(0, content.indexOf(match) - 50), content.indexOf(match)).toLowerCase().includes('vet')) category = 'vet';
    else if (filePath.toLowerCase().includes('groom') || content.substring(Math.max(0, content.indexOf(match) - 50), content.indexOf(match)).toLowerCase().includes('groom')) category = 'grooming';
    else if (filePath.toLowerCase().includes('avatar') || content.substring(Math.max(0, content.indexOf(match) - 50), content.indexOf(match)).toLowerCase().includes('avatar')) category = 'avatars';
    else if (filePath.toLowerCase().includes('dashboard') || content.substring(Math.max(0, content.indexOf(match) - 50), content.indexOf(match)).toLowerCase().includes('profile')) category = 'avatars';

    return getUniqueImage(category);
  });

  if (modified) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`Updated images in: ${filePath}`);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (!fullPath.includes('node_modules') && !fullPath.includes('.git') && !fullPath.includes('dist')) {
        walkDir(fullPath);
      }
    } else {
      if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js') || fullPath.endsWith('.json')) {
        processFile(fullPath);
      }
    }
  }
}

// Audit data
walkDir(path.join(__dirname, 'server/data'));
walkDir(path.join(__dirname, 'src'));
console.log('Site-wide Image Audit Complete.');
