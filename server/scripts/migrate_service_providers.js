import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { supabase } from '../config/supabase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const PROVIDERS_FILE = path.join(DATA_DIR, 'service_providers.json');

async function migrateData() {
  console.log('--- JOSH PETS HUB: USER & SERVICE PROVIDER SEPARATION ---');

  if (!fs.existsSync(USERS_FILE)) {
    console.error('users.json file not found at:', USERS_FILE);
    return;
  }

  const allUsers = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
  console.log(`Read ${allUsers.length} total accounts from users.json`);

  const providers = allUsers.filter(u => u.role === 'SERVICE_PROVIDER');
  const customers = allUsers.filter(u => u.role !== 'SERVICE_PROVIDER');

  console.log(`Found ${customers.length} Customers/Admins and ${providers.length} Service Providers.`);

  // 1. Write separate server/data/service_providers.json
  fs.writeFileSync(PROVIDERS_FILE, JSON.stringify(providers, null, 2), 'utf8');
  console.log(`Saved ${providers.length} service providers to server/data/service_providers.json`);

  // 2. Write cleaned server/data/users.json
  fs.writeFileSync(USERS_FILE, JSON.stringify(customers, null, 2), 'utf8');
  console.log(`Saved ${customers.length} users/admins to server/data/users.json`);

  // 3. Check Supabase service_providers table status
  if (supabase) {
    try {
      const { data, error } = await supabase.from('service_providers').select('id').limit(1);
      if (error) {
        console.log('\n[NOTICE] Supabase table "service_providers" is not yet active in cloud schema cache.');
        console.log('To activate cloud persistence in Supabase:');
        console.log('  1. Open: https://supabase.com/dashboard/project/chkaqdokgyppcadfkoce/sql/new');
        console.log('  2. Run the SQL script: database/create_service_providers_table.sql');
      } else {
        console.log('\n[SUCCESS] Supabase "service_providers" table is ACTIVE in cloud!');
        console.log(`Upserting ${providers.length} providers to Supabase service_providers table...`);
        const { error: upsertErr } = await supabase.from('service_providers').upsert(providers, { onConflict: 'email' });
        if (upsertErr) {
          console.error('Upsert notice:', upsertErr.message);
        } else {
          console.log('All providers successfully saved to Supabase service_providers table.');
        }
      }
    } catch (err) {
      console.warn('Supabase check notice:', err.message);
    }
  }

  console.log('\nMigration complete.');
}

migrateData();

