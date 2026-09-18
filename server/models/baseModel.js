import { supabaseService } from '../services/supabaseService.js';

export const createModel = (tableName) => {
  return {
    tableName,
    async find(filter = {}) {
      return await supabaseService.find(tableName, filter);
    },
    async findOne(filter = {}) {
      return await supabaseService.findOne(tableName, filter);
    },
    async findById(id) {
      return await supabaseService.getById(tableName, id);
    },
    async create(data) {
      return await supabaseService.insert(tableName, data);
    },
    async countDocuments(filter = {}) {
      return await supabaseService.count(tableName, filter);
    },
    async findByIdAndUpdate(id, updates) {
      return await supabaseService.update(tableName, id, updates);
    },
    async findByIdAndDelete(id) {
      return await supabaseService.delete(tableName, id);
    },
    async deleteMany(filter = {}) {
      const all = await supabaseService.find(tableName, filter);
      for (const item of all) {
        await supabaseService.delete(tableName, item.id || item._id);
      }
      return { deletedCount: all.length };
    },
    async insertMany(items = []) {
      const results = [];
      for (const item of items) {
        results.push(await supabaseService.insert(tableName, item));
      }
      return results;
    },
    async aggregate() {
      return [];
    }
  };
};

export default createModel;
