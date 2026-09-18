// Supabase is the exclusive database provider for Pawora
import { supabase } from './supabase.js';

export const connectDB = async () => {
  return !!supabase;
};

export default connectDB;
