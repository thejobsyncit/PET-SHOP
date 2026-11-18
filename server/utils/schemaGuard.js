import { supabase } from '../config/supabase.js';

const REQUIRED_TABLES = [
  'users',
  'products',
  'categories',
  'orders',
  'bookings',
  'services',
  'coupons',
  'announcements',
  'blogs',
  'enquiries',
  'crm_roles',
  'crm_users',
  'crm_tickets',
  'crm_tasks',
  'crm_leads',
  'cookie_consents'
];

/**
 * Validates whether all required tables exist in Supabase on server startup.
 * Emits clear warnings if any tables are missing.
 */
export async function verifySupabaseTables() {
  if (!supabase) {
    console.warn('⚠️ [Supabase Guard] Supabase client is not configured.');
    return;
  }

  try {
    const missing = [];
    for (const table of REQUIRED_TABLES) {
      const { error } = await supabase.from(table).select('id').limit(1);
      if (error && (error.code === 'PGRST205' || error.message?.includes('Could not find the table'))) {
        missing.push(table);
      }
    }

    if (missing.length === 0) {
      console.log('✅ [Supabase Cloud] All required tables are verified & active in Supabase!');
    } else {
      console.warn('\n' + '='.repeat(70));
      console.warn(`⚠️ [Supabase Alert] ${missing.length} table(s) missing in Supabase:`);
      console.warn(`   Missing: ${missing.join(', ')}`);
      console.warn('   To fix: Run the SQL migration script in database/supabase_complete_schema.sql');
      console.warn('='.repeat(70) + '\n');
    }
  } catch (err) {
    console.warn('[Supabase Guard] Error running table check:', err.message);
  }
}

