import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const getFilePath = (collection) => path.join(DATA_DIR, `${collection}.json`);

export const readMockData = (collection) => {
  const filePath = getFilePath(collection);
  if (!fs.existsSync(filePath)) {
    return [];
  }
  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error(`Error reading mock file ${collection}:`, err);
    return [];
  }
};

export const writeMockData = (collection, data) => {
  const filePath = getFilePath(collection);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error(`Error writing mock file ${collection}:`, err);
    return false;
  }
};

// Check if Mongoose is connected
export const isDbConnected = () => {
  return mongoose.connection.readyState === 1;
};

// Wrapper for collection queries to handle Mongoose vs Mock DB transparently
export const getDbData = async (collectionName, mongooseModel, filter = {}) => {
  if (isDbConnected()) {
    return await mongooseModel.find(filter);
  } else {
    const mockList = readMockData(collectionName);
    // Basic filter implementation
    return mockList.filter(item => {
      for (const key in filter) {
        if (filter[key] !== undefined && item[key] !== filter[key]) {
          return false;
        }
      }
      return true;
    });
  }
};
