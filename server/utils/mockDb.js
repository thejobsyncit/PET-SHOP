<<<<<<< HEAD
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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
    console.error(`Error reading data for ${collection}:`, err);
    return [];
  }
};

export const writeMockData = (collection, data) => {
  const filePath = getFilePath(collection);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error(`Error writing data for ${collection}:`, err);
    return false;
  }
};

// MongoDB is permanently removed - always false
export const isDbConnected = () => {
  return false;
};

// Wrapper for collection queries (Supabase-first / Local Cache)
export const getDbData = async (collectionName, _, filter = {}) => {
  const list = readMockData(collectionName);
  return list.filter((item) => {
    for (const key in filter) {
      if (filter[key] !== undefined && item[key] !== filter[key]) {
        return false;
      }
    }
    return true;
  });
};
=======
// Stub mockDb.js to prevent crashes in unmigrated controllers
export const isDbConnected = () => true; // Force DB path in unmigrated controllers
export const readMockData = () => [];
export const writeMockData = () => {};
export const getDbData = () => [];
>>>>>>> origin/main
