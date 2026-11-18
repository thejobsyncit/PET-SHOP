import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { supabase } from '../config/supabase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SERVER_DATA_DIR = path.resolve(__dirname, '../../server_data');
const DATA_DIR = path.resolve(__dirname, '../data');

const loadJson = (dir, file) => {
  const fullPath = path.join(dir, file);
  if (!fs.existsSync(fullPath)) return [];
  try {
    const raw = fs.readFileSync(fullPath, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : (parsed.items || []);
  } catch (err) {
    console.warn(`Could not read ${file}:`, err.message);
    return [];
  }
};

async function testTableExists(tableName) {
  try {
    const { error } = await supabase.from(tableName).select('id').limit(1);
    if (error && (error.code === 'PGRST205' || error.message.includes('Could not find the table'))) {
      return false;
    }
    return !error;
  } catch {
    return false;
  }
}

async function syncListings() {
  const listings = loadJson(DATA_DIR, 'listings.json');
  if (!listings.length) return;
  console.log(`Syncing ${listings.length} classified listings...`);

  const mapped = listings.map(l => ({
    id: l.id || l._id,
    user_id: l.user || l.userId || null,
    user: l.user || l.userId || null,
    title: l.title || l.petName || 'Pet Listing',
    pet_name: l.petName || l.title || 'Pet',
    pet_type: l.petType || 'dog',
    petType: l.petType || 'dog',
    breed: l.breed || '',
    age: l.age || '',
    price: l.price || 0,
    quantity: l.quantity || 1,
    location: l.location || '',
    description: l.description || '',
    images: Array.isArray(l.images) ? l.images : (l.photos || []),
    photos: Array.isArray(l.photos) ? l.photos : (l.images || []),
    contact_phone: l.contactPhone || '',
    contactPhone: l.contactPhone || '',
    is_verified: l.isVerified !== false,
    isVerified: l.isVerified !== false,
    vaccination_certificate: l.vaccinationCertificate || null,
    vaccinationCertificate: l.vaccinationCertificate || null,
    payment_status: l.paymentStatus || 'Pending',
    paymentStatus: l.paymentStatus || 'Pending',
    payment_amount: l.paymentAmount || 0,
    paymentAmount: l.paymentAmount || 0,
    status: l.status || 'Active'
  }));

  const { error } = await supabase.from('listings').upsert(mapped, { onConflict: 'id' });
  if (error) console.error('  Failed to sync listings:', error.message);
  else console.log('  Listings synced successfully.');
}

async function syncBreedings() {
  const breedings = loadJson(DATA_DIR, 'breedings.json');
  if (!breedings.length) return;
  console.log(`Syncing ${breedings.length} stud breedings...`);

  const mapped = breedings.map(b => ({
    id: b.id || b._id,
    user_id: b.user || b.userId || null,
    user: b.user || b.userId || null,
    stud_name: b.studName || 'Champion Stud',
    studName: b.studName || 'Champion Stud',
    pet_type: b.petType || 'dog',
    petType: b.petType || 'dog',
    breed: b.breed || '',
    age: b.age || '',
    kci_number: b.kciNumber || null,
    kciNumber: b.kciNumber || null,
    stud_fee: b.studFee || 0,
    studFee: b.studFee || 0,
    description: b.description || '',
    images: Array.isArray(b.images) ? b.images : [],
    pedigree_details: b.pedigreeDetails || {},
    pedigreeDetails: b.pedigreeDetails || {},
    location: b.location || '',
    contact_phone: b.contactPhone || '',
    contactPhone: b.contactPhone || '',
    is_verified: b.isVerified !== false,
    isVerified: b.isVerified !== false
  }));

  const { error } = await supabase.from('breedings').upsert(mapped, { onConflict: 'id' });
  if (error) console.error('  Failed to sync breedings:', error.message);
  else console.log('  Breedings synced successfully.');
}

async function syncAdoptions() {
  const adoptions = loadJson(DATA_DIR, 'adoptions.json');
  if (!adoptions.length) return;
  console.log(`Syncing ${adoptions.length} pet adoptions...`);

  const mapped = adoptions.map(a => ({
    id: a.id || a._id,
    shelter_name: a.shelterName || 'Josh Rescue Shelter',
    shelterName: a.shelterName || 'Josh Rescue Shelter',
    shelter_location: a.shelterLocation || '',
    shelterLocation: a.shelterLocation || '',
    pet_name: a.petName || 'Rescue Pet',
    petName: a.petName || 'Rescue Pet',
    pet_type: a.petType || 'dog',
    petType: a.petType || 'dog',
    breed: a.breed || '',
    age: a.age || '',
    rescue_story: a.rescueStory || '',
    rescueStory: a.rescueStory || '',
    image: a.image || '',
    health_status: a.healthStatus || 'Healthy & Vaccinated',
    healthStatus: a.healthStatus || 'Healthy & Vaccinated',
    adoption_fee: a.adoptionFee || 0,
    adoptionFee: a.adoptionFee || 0,
    inquiries: a.inquiries || 0
  }));

  const { error } = await supabase.from('adoptions').upsert(mapped, { onConflict: 'id' });
  if (error) console.error('  Failed to sync adoptions:', error.message);
  else console.log('  Adoptions synced successfully.');
}

async function syncPayoutsAndBank() {
  const payouts = loadJson(SERVER_DATA_DIR, 'provider_payouts.json');
  if (payouts.length) {
    console.log(`Syncing ${payouts.length} provider payouts...`);
    const mapped = payouts.map(p => ({
      id: p.id,
      provider_id: p.providerId || '',
      providerId: p.providerId || '',
      provider_email: p.providerEmail || '',
      providerEmail: p.providerEmail || '',
      provider_name: p.providerName || '',
      providerName: p.providerName || '',
      service_category: p.serviceCategory || '',
      serviceCategory: p.serviceCategory || '',
      amount: p.amount || 0,
      payout_method: p.payoutMethod || 'upi',
      payoutMethod: p.payoutMethod || 'upi',
      upi_id: p.upiId || null,
      upiId: p.upiId || null,
      status: p.status || 'Pending',
      bank_details: p.bankDetails || {},
      bankDetails: p.bankDetails || {},
      requested_at: p.requestedAt || new Date().toISOString(),
      requestedAt: p.requestedAt || new Date().toISOString(),
      processed_at: p.processedAt || null,
      processedAt: p.processedAt || null,
      admin_notes: p.adminNotes || null,
      adminNotes: p.adminNotes || null,
      transfer_reference: p.transferReference || null,
      transferReference: p.transferReference || null
    }));
    const { error } = await supabase.from('provider_payouts').upsert(mapped, { onConflict: 'id' });
    if (error) console.error('  Failed to sync provider payouts:', error.message);
    else console.log('  Provider payouts synced successfully.');
  }

  const bank = loadJson(SERVER_DATA_DIR, 'provider_bank_accounts.json');
  if (bank.length) {
    console.log(`Syncing ${bank.length} provider bank accounts...`);
    const mapped = bank.map((b, idx) => ({
      id: b.id || `bnk_${idx + 1}`,
      provider_id: b.providerId || '',
      providerId: b.providerId || '',
      provider_email: b.providerEmail || '',
      providerEmail: b.providerEmail || '',
      provider_name: b.providerName || '',
      providerName: b.providerName || '',
      account_holder: b.accountHolder || '',
      accountHolder: b.accountHolder || '',
      bank_name: b.bankName || '',
      bankName: b.bankName || '',
      account_number_masked: b.accountNumberMasked || '',
      accountNumberMasked: b.accountNumberMasked || '',
      account_number_encrypted: b.accountNumberEncrypted || '',
      accountNumberEncrypted: b.accountNumberEncrypted || '',
      ifsc: b.ifsc || '',
      is_verified: b.isVerified !== false,
      isVerified: b.isVerified !== false,
      verified_at: b.verifiedAt || null,
      verifiedAt: b.verifiedAt || null
    }));
    const { error } = await supabase.from('provider_bank_accounts').upsert(mapped, { onConflict: 'provider_id' });
    if (error) console.error('  Failed to sync provider bank accounts:', error.message);
    else console.log('  Provider bank accounts synced successfully.');
  }
}

async function runSync() {
  console.log('--- JOSH PETS HUB: FULL DATA SYNC ROUTINE ---');
  if (!supabase) {
    console.error('Supabase client not initialized.');
    process.exit(1);
  }

  if (await testTableExists('listings')) await syncListings();
  if (await testTableExists('breedings')) await syncBreedings();
  if (await testTableExists('adoptions')) await syncAdoptions();
  if (await testTableExists('provider_payouts')) await syncPayoutsAndBank();

  console.log('\n=== ALL REMAINING SERVICE PROVIDER DATA SYNCED TO SUPABASE ===');
  process.exit(0);
}

runSync();
