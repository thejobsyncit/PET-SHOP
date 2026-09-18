import { supabase } from '../config/supabase.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');

// Ensure data cache directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const getFilePath = (table) => path.join(DATA_DIR, `${table}.json`);

// Local Cache Helper
export const readLocalData = (table) => {
  const filePath = getFilePath(table);
  if (!fs.existsSync(filePath)) return [];
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    console.error(`Error reading local data for ${table}:`, err.message);
    return [];
  }
};

export const writeLocalData = (table, data) => {
  const filePath = getFilePath(table);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error(`Error writing local data for ${table}:`, err.message);
    return false;
  }
};

export const isSupabaseConfigured = () => {
  return !!supabase;
};

// Unified Supabase Service
export const supabaseService = {
  // Query all items from table (Supabase primary, local fallback)
  async getAll(table, options = {}) {
    if (supabase) {
      try {
        let query = supabase.from(table).select(options.select || '*');
        if (options.order) {
          query = query.order(options.order.column, { ascending: options.order.ascending ?? true });
        }
        if (options.limit) {
          query = query.limit(options.limit);
        }
        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          return data;
        }
      } catch (err) {
        // Fall back to local data if remote table not found
      }
    }
    return readLocalData(table);
  },

  // Query single item by ID or predicate
  async getById(table, id) {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .eq('id', id)
          .maybeSingle();
        if (!error && data) return data;
      } catch (err) {}
    }
    const local = readLocalData(table);
    return local.find((item) => (item._id && item._id.toString() === id.toString()) || item.id === id) || null;
  },

  // Query items with a filter predicate
  async find(table, filterPredicate = null) {
    const all = await this.getAll(table);
    if (typeof filterPredicate === 'function') {
      return all.filter(filterPredicate);
    }
    if (filterPredicate && typeof filterPredicate === 'object') {
      return all.filter((item) => {
        for (const [k, v] of Object.entries(filterPredicate)) {
          if (item[k] !== v) return false;
        }
        return true;
      });
    }
    return all;
  },

  // Find single item matching criteria
  async findOne(table, filterPredicate) {
    const list = await this.find(table, filterPredicate);
    return list.length > 0 ? list[0] : null;
  },

  // Insert a new item
  async insert(table, item) {
    const id = item.id || item._id || ('sp_' + Date.now() + Math.random().toString(36).substr(2, 6));
    const record = {
      ...item,
      id,
      _id: id,
      created_at: item.created_at || item.createdAt || new Date().toISOString()
    };

    if (supabase) {
      try {
        await supabase.from(table).insert([record]);
      } catch (err) {
        // Continue with local storage if remote table isn't created yet
      }
    }

    const list = readLocalData(table);
    list.push(record);
    writeLocalData(table, list);
    return record;
  },

  // Update an existing item
  async update(table, id, updates) {
    if (supabase) {
      try {
        await supabase.from(table).update(updates).eq('id', id);
      } catch (err) {}
    }

    const list = readLocalData(table);
    const index = list.findIndex((item) => (item._id && item._id.toString() === id.toString()) || item.id === id);
    if (index !== -1) {
      list[index] = { ...list[index], ...updates, updatedAt: new Date().toISOString() };
      writeLocalData(table, list);
      return list[index];
    }
    return null;
  },

  // Delete an item
  async delete(table, id) {
    if (supabase) {
      try {
        await supabase.from(table).delete().eq('id', id);
      } catch (err) {}
    }

    const list = readLocalData(table);
    const filtered = list.filter((item) => (item._id && item._id.toString() !== id.toString()) && item.id !== id);
    writeLocalData(table, filtered);
    return true;
  },

  // Count items
  async count(table, filterPredicate = null) {
    const items = await this.find(table, filterPredicate);
    return items.length;
  }
};

export default supabaseService;
