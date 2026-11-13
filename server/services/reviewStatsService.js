import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SEED_REVIEWS_FILE = path.join(__dirname, '..', 'data', 'reviews.json');
const REVIEWS_STATE_FILE = path.join(__dirname, '..', '..', 'server_data', 'reviews_state.json');
const DISK_PRODUCTS_FILE = path.join(__dirname, '..', 'data', 'products.json');

/**
 * Load all unique reviews across persistent state and seed file
 */
export const loadAllReviews = () => {
  const map = new Map();

  // 1. Load seed reviews
  try {
    if (fs.existsSync(SEED_REVIEWS_FILE)) {
      const content = fs.readFileSync(SEED_REVIEWS_FILE, 'utf8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        for (const r of parsed) {
          const key = String(r._id || r.id || `${r.user || r.user_id}_${r.rating}_${r.title}`);
          map.set(key, r);
        }
      }
    }
  } catch (_) {}

  // 2. Load state reviews (takes precedence)
  try {
    if (fs.existsSync(REVIEWS_STATE_FILE)) {
      const content = fs.readFileSync(REVIEWS_STATE_FILE, 'utf8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        for (const r of parsed) {
          const key = String(r._id || r.id || `${r.user || r.user_id}_${r.rating}_${r.title}`);
          map.set(key, r);
        }
      }
    }
  } catch (_) {}

  return Array.from(map.values());
};

/**
 * Load disk products
 */
export const loadDiskProducts = () => {
  try {
    if (fs.existsSync(DISK_PRODUCTS_FILE)) {
      const content = fs.readFileSync(DISK_PRODUCTS_FILE, 'utf8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (_) {}
  return [];
};

/**
 * Build Map of product identifier (id, _id, slug) -> { reviewCount, rating, reviews }
 */
export const getProductReviewStatsMap = () => {
  const reviews = loadAllReviews();
  const products = loadDiskProducts();

  // Build alias lookup: id -> slug, slug -> id
  const aliasMap = new Map();
  for (const p of products) {
    const pId = String(p._id || p.id || '').trim().toLowerCase();
    const pSlug = String(p.slug || '').trim().toLowerCase();
    if (pId && pSlug) {
      aliasMap.set(pId, pSlug);
      aliasMap.set(pSlug, pId);
    }
  }

  // Group reviews by normalized target key
  const grouped = new Map(); // primaryKey -> review[]

  for (const r of reviews) {
    const rProd = String(r.product || r.product_id || r.productId || '').trim().toLowerCase();
    const rSlug = String(r.productSlug || r.slug || '').trim().toLowerCase();

    // Determine canonical key (prefer product ID, fallback to slug)
    let canonicalKey = rProd || rSlug;
    if (rSlug && aliasMap.has(rSlug)) {
      canonicalKey = aliasMap.get(rSlug);
    } else if (rProd && aliasMap.has(rProd)) {
      canonicalKey = rProd;
    }

    if (!canonicalKey) continue;

    if (!grouped.has(canonicalKey)) {
      grouped.set(canonicalKey, []);
    }
    grouped.get(canonicalKey).push(r);
  }

  // Create lookup map accessible by both id and slug
  const statsMap = new Map();

  for (const [key, revs] of grouped.entries()) {
    const count = revs.length;
    const avgRating = count > 0
      ? Number((revs.reduce((sum, r) => sum + (Number(r.rating) || 5), 0) / count).toFixed(1))
      : 0;

    const stat = { reviewCount: count, rating: avgRating, reviews: revs };
    statsMap.set(key, stat);

    // Also index by corresponding alias if available
    if (aliasMap.has(key)) {
      statsMap.set(aliasMap.get(key), stat);
    }
  }

  return statsMap;
};

/**
 * Get review stats for a single product by identifier (id or slug)
 */
export const getReviewStatsForProduct = (productId, productSlug) => {
  const statsMap = getProductReviewStatsMap();
  const idKey = String(productId || '').trim().toLowerCase();
  const slugKey = String(productSlug || '').trim().toLowerCase();

  if (idKey && statsMap.has(idKey)) return statsMap.get(idKey);
  if (slugKey && statsMap.has(slugKey)) return statsMap.get(slugKey);

  return { reviewCount: 0, rating: 0, reviews: [] };
};

/**
 * Synchronize disk products.json reviewCount and rating with real review records
 */
export const syncProductDiskReviewStats = () => {
  try {
    const statsMap = getProductReviewStatsMap();
    const products = loadDiskProducts();
    let modified = false;

    const updated = products.map((p) => {
      const pId = String(p._id || p.id || '').trim().toLowerCase();
      const pSlug = String(p.slug || '').trim().toLowerCase();

      const stat = (pId && statsMap.get(pId)) || (pSlug && statsMap.get(pSlug)) || null;
      const trueReviewCount = stat ? stat.reviewCount : 0;
      const trueRating = stat && stat.reviewCount > 0 ? stat.rating : (Number(p.rating || p.ratings) || 0);

      if (p.reviewCount !== trueReviewCount || (stat && stat.reviewCount > 0 && p.rating !== trueRating)) {
        modified = true;
        return {
          ...p,
          reviewCount: trueReviewCount,
          review_count: trueReviewCount,
          numReviews: trueReviewCount,
          rating: trueRating,
          ratings: trueRating
        };
      }
      return p;
    });

    if (modified && fs.existsSync(DISK_PRODUCTS_FILE)) {
      fs.writeFileSync(DISK_PRODUCTS_FILE, JSON.stringify(updated, null, 2), 'utf8');
    }
    return updated;
  } catch (err) {
    console.warn('[ReviewStatsService] Error syncing disk review stats:', err?.message);
    return [];
  }
};

