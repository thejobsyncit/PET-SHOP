import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { supabase } from '../config/supabase.js';
import { users, products, categories, blogs, reviews } from './seedData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const seedData = async () => {
  console.log('Starting Supabase Seeding Process...');

  // 1. Generate Static IDs
  const userIds = [
    '60d5ec49ad70591244000000', // Superadmin
    '60d5ec49ad70591244000001', // Admin
    '60d5ec49ad70591244000002', // Aarav
    '60d5ec49ad70591244000003', // Ananya
    '60d5ec49ad70591244000004', // Rahul
    '60d5ec49ad70591244000005', // Pooja
    '60d5ec49ad70591244000006', // Vikram
  ];

  // Map users with static IDs
  const mappedUsers = users.map((u, i) => ({
    _id: userIds[i],
    id: userIds[i],
    ...u,
    wishlist: [],
    cart: []
  }));

  // Create products with fixed IDs
  const mappedProducts = products.map((p, i) => {
    const hex = i.toString(16).padStart(6, '0');
    const pId = `60d5ec49ad70591244${hex}`;
    return {
      _id: pId,
      id: pId,
      ...p,
      discountPercentage: p.discountPrice && p.price > 0 
        ? Math.round(((p.price - p.discountPrice) / p.price) * 100)
        : 0
    };
  });

  // Map categories with fixed IDs
  const mappedCategories = categories.map((c, i) => {
    const hex = i.toString(16).padStart(6, '0');
    const cId = `60d5ec49ad70591245${hex}`;
    return {
      _id: cId,
      id: cId,
      ...c
    };
  });

  // Map blogs with fixed IDs
  const mappedBlogs = blogs.map((b, i) => {
    const hex = i.toString(16).padStart(6, '0');
    const bId = `60d5ec49ad70591246${hex}`;
    return {
      _id: bId,
      id: bId,
      ...b
    };
  });

  // Map reviews with fixed IDs
  const mappedReviews = reviews.map((r, i) => ({
    _id: `60d5ec49ad7059124700000${i + 1}`,
    id: `60d5ec49ad7059124700000${i + 1}`,
    ...r
  }));

  // Map coupons with fixed IDs
  const mappedCoupons = [
    {
      _id: '60d5ec49ad70591248000001',
      id: '60d5ec49ad70591248000001',
      code: 'WELCOME10',
      discountType: 'percentage',
      discountAmount: 10,
      minPurchase: 500,
      maxDiscount: 200,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      isActive: true,
      usageCount: 0
    },
    {
      _id: '60d5ec49ad70591248000002',
      id: '60d5ec49ad70591248000002',
      code: 'FLAT200',
      discountType: 'fixed',
      discountAmount: 200,
      minPurchase: 1500,
      maxDiscount: 200,
      expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      isActive: true,
      usageCount: 0
    }
  ];

  // 2. Write Data Files
  const dataDir = path.join(__dirname, '..', 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  fs.writeFileSync(path.join(dataDir, 'users.json'), JSON.stringify(mappedUsers, null, 2));
  fs.writeFileSync(path.join(dataDir, 'products.json'), JSON.stringify(mappedProducts, null, 2));
  fs.writeFileSync(path.join(dataDir, 'categories.json'), JSON.stringify(mappedCategories, null, 2));
  fs.writeFileSync(path.join(dataDir, 'blogs.json'), JSON.stringify(mappedBlogs, null, 2));
  fs.writeFileSync(path.join(dataDir, 'reviews.json'), JSON.stringify(mappedReviews, null, 2));
  fs.writeFileSync(path.join(dataDir, 'coupons.json'), JSON.stringify(mappedCoupons, null, 2));
  fs.writeFileSync(path.join(dataDir, 'orders.json'), JSON.stringify([], null, 2));
  fs.writeFileSync(path.join(dataDir, 'prescriptions.json'), JSON.stringify([], null, 2));
  fs.writeFileSync(path.join(dataDir, 'notifications.json'), JSON.stringify([], null, 2));

  console.log('Local data files generated successfully inside server/data/.');

  // 3. Sync to Supabase Cloud if available
  if (supabase) {
    console.log('Syncing data to Supabase...');
    try {
      await supabase.from('categories').upsert(mappedCategories);
      await supabase.from('products').upsert(mappedProducts);
      console.log('Supabase tables synced successfully.');
    } catch (err) {
      console.log('Supabase sync skipped (tables may be pending in remote project). Local data is active.');
    }
  }

  console.log('Seeding finished successfully.');
  process.exit(0);
};

seedData().catch(err => {
  console.error('Seeding process failed:', err);
  process.exit(1);
});
