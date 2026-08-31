import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Review from '../models/Review.js';
import Blog from '../models/Blog.js';
import Coupon from '../models/Coupon.js';
import { users, products, categories, blogs, reviews } from './seedData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const seedData = async () => {
  console.log('Starting Seeding Process...');
  
  // 1. Generate Static Object IDs
  const userIds = [
    new mongoose.Types.ObjectId('60d5ec49ad70591244000000'), // Superadmin
    new mongoose.Types.ObjectId('60d5ec49ad70591244000001'), // Admin
    new mongoose.Types.ObjectId('60d5ec49ad70591244000002'), // Aarav
    new mongoose.Types.ObjectId('60d5ec49ad70591244000003'), // Ananya
    new mongoose.Types.ObjectId('60d5ec49ad70591244000004'), // Rahul
    new mongoose.Types.ObjectId('60d5ec49ad70591244000005'), // Pooja
    new mongoose.Types.ObjectId('60d5ec49ad70591244000006'), // Vikram
  ];

  // Map users with static IDs
  const mappedUsers = users.map((u, i) => ({
    _id: userIds[i],
    ...u,
    wishlist: [],
    cart: []
  }));

  // Create products with fixed IDs
  const mappedProducts = products.map((p, i) => {
    // Generate static ID for product
    const hex = i.toString(16).padStart(6, '0');
    const pId = new mongoose.Types.ObjectId(`60d5ec49ad70591244${hex}`);
    return {
      _id: pId,
      ...p,
      discountPercentage: p.discountPrice && p.price > 0 
        ? Math.round(((p.price - p.discountPrice) / p.price) * 100)
        : 0
    };
  });

  // Map categories with fixed IDs
  const mappedCategories = categories.map((c, i) => {
    const hex = i.toString(16).padStart(6, '0');
    const cId = new mongoose.Types.ObjectId(`60d5ec49ad70591245${hex}`);
    return {
      _id: cId,
      ...c,
      subcategories: c.name === 'Dog Food' ? ['Dog Food', 'Treats', 'Toys', 'Beds', 'Grooming', 'Collars & Leashes', 'Bowls & Feeders', 'Training', 'Supplements'] :
                     c.name === 'Treats' ? ['Treats', 'Beds', 'Grooming', 'Collars & Leashes', 'Toys', 'Supplements'] :
                     c.name === 'Dog Beds & Cotes' ? ['Beds', 'Collars & Leashes'] :
                     c.name === 'Bird Food' ? ['Bird Food', 'Supplements'] :
                     c.name === 'Cages & Habitat' ? ['Cages', 'Perches', 'Toys', 'Feeding Accessories'] :
                     c.name === 'Terrariums' ? ['Terrariums', 'Substrate', 'Décor'] :
                     c.name === 'Heating & Lighting' ? ['UVB Lighting', 'Heating', 'Calcium & Supplements', 'Thermometers'] :
                     c.name === 'Aquariums & Tanks' ? ['Aquariums'] :
                     c.name === 'Water Care & Filtration' ? ['Water Conditioners', 'Fish Food', 'Filters', 'Pumps', 'Aquarium Lighting', 'Aquarium Plants'] :
                     c.name === 'Vitamins & Supplements' ? ['Vitamins', 'Supplements', 'Joint Care', 'Digestive Care'] :
                     c.name === 'First Aid & Healthcare' ? ['First Aid', 'Skin Care', 'Joint Care'] : []
    };
  });

  // Map blogs with fixed IDs and attach related products
  const mappedBlogs = blogs.map((b, i) => {
    const hex = i.toString(16).padStart(6, '0');
    const bId = new mongoose.Types.ObjectId(`60d5ec49ad70591246${hex}`);
    
    // Pick first 2 products of corresponding pet type as related products
    const petProducts = mappedProducts
      .filter(p => p.petType === b.petType)
      .slice(0, 2)
      .map(p => p._id);

    return {
      _id: bId,
      ...b,
      relatedProducts: petProducts
    };
  });

  // Map reviews: we map the reviews to products. We have 5 reviews. Let's link them to products and users.
  // Review 0 -> Product 0 (Royal Canin), User 1 (Aarav)
  // Review 1 -> Product 0 (Royal Canin), User 2 (Ananya)
  // Review 2 -> Product 21 (Beaphar Joint Fit), User 1 (Aarav)
  // Review 3 -> Product 16 (Exo Terra Glass Terrarium), User 2 (Ananya)
  // Review 4 -> Product 24 (API Stress Coat), User 1 (Aarav)
  const productIds = mappedProducts.map(p => p._id);
  const mappedReviews = [
    {
      _id: new mongoose.Types.ObjectId('60d5ec49ad70591247000001'),
      user: userIds[2],
      userName: mappedUsers[2].name,
      product: productIds[0], // Royal Canin
      ...reviews[0]
    },
    {
      _id: new mongoose.Types.ObjectId('60d5ec49ad70591247000002'),
      user: userIds[3],
      userName: mappedUsers[3].name,
      product: productIds[0], // Royal Canin
      ...reviews[1]
    },
    {
      _id: new mongoose.Types.ObjectId('60d5ec49ad70591247000003'),
      user: userIds[2],
      userName: mappedUsers[2].name,
      product: productIds[21], // Beaphar Joint Fit
      ...reviews[2]
    },
    {
      _id: new mongoose.Types.ObjectId('60d5ec49ad70591247000004'),
      user: userIds[3],
      userName: mappedUsers[3].name,
      product: productIds[16], // Exo Terra Glass Terrarium
      ...reviews[3]
    },
    {
      _id: new mongoose.Types.ObjectId('60d5ec49ad70591247000005'),
      user: userIds[2],
      userName: mappedUsers[2].name,
      product: productIds[24], // API Stress Coat
      ...reviews[4]
    }
  ];

  // Map Coupons
  const expiryDate = new Date();
  expiryDate.setMonth(expiryDate.getMonth() + 6);
  const mappedCoupons = [
    {
      _id: new mongoose.Types.ObjectId('60d5ec49ad70591248000001'),
      code: 'PAWORA10',
      discountType: 'percentage',
      discountValue: 10,
      minOrderValue: 999,
      maxDiscount: 500,
      expiresAt: expiryDate,
      isActive: true
    },
    {
      _id: new mongoose.Types.ObjectId('60d5ec49ad70591248000002'),
      code: 'WELCOME300',
      discountType: 'flat',
      discountValue: 300,
      minOrderValue: 2499,
      expiresAt: expiryDate,
      isActive: true
    }
  ];

  // 2. Write to JSON files for Local/Mock DB Support
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

  console.log('Mock JSON database files created successfully inside server/data/.');

  // 3. Connect to MongoDB and Seed
  const isConnected = await connectDB();
  if (isConnected) {
    try {
      // Clear existing records
      await User.deleteMany({});
      await Product.deleteMany({});
      await Category.deleteMany({});
      await Review.deleteMany({});
      await Blog.deleteMany({});
      await Coupon.deleteMany({});
      
      // Insert new records
      await User.insertMany(mappedUsers);
      await Product.insertMany(mappedProducts);
      await Category.insertMany(mappedCategories);
      await Review.insertMany(mappedReviews);
      await Blog.insertMany(mappedBlogs);
      await Coupon.insertMany(mappedCoupons);

      console.log('MongoDB database seeded successfully!');
    } catch (dbError) {
      console.error('Error during MongoDB write, but JSON files are intact:', dbError.message);
    } finally {
      await mongoose.disconnect();
      console.log('Disconnected from MongoDB.');
    }
  } else {
    console.log('Skipped MongoDB seeding since server could not connect. Mock database files are ready.');
  }
  
  console.log('Seeding finished successfully.');
  process.exit(0);
};

seedData().catch(err => {
  console.error('Seeding process failed:', err);
  process.exit(1);
});
