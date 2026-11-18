-- ==============================================================================
-- JOSH PETS HUB - MASTER SUPABASE POSTGRESQL SCHEMA MIGRATION
-- Run this complete SQL script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/chkaqdokgyppcadfkoce/sql/new
--
-- This script covers ALL 4 DOMAINS:
-- 1. USER & E-COMMERCE (users, products, categories, orders, coupons, reviews, prescriptions, blogs, cookie_consents)
-- 2. SERVICE PROVIDER (services, bookings, listings, breedings, adoptions, provider_payouts, bank_accounts)
-- 3. SUPER ADMIN & FINANCE (announcements, enquiries, messages, notifications, platform_wallet_ledger, financial_audit_logs)
-- 4. ENTERPRISE CRM (crm_roles, crm_users, crm_tickets, crm_tasks, crm_leads, crm_refunds, crm_incidents)
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- SECTION 1: USER & AUTHENTICATION
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT,
  role TEXT DEFAULT 'CUSTOMER' CHECK (role IN ('CUSTOMER', 'ADMIN', 'SERVICE_PROVIDER', 'SUPERADMIN')),
  mobile TEXT,
  phone TEXT,
  whatsapp TEXT,
  whatsapp_number TEXT,
  location TEXT,
  service_category TEXT,
  business_name TEXT,
  govt_proof_type TEXT,
  govt_proof_number TEXT,
  govt_proof_doc TEXT,
  verification_status TEXT DEFAULT 'Verified',
  shelter_capacity INT DEFAULT 50,
  bio TEXT,
  avatar TEXT,
  addresses JSONB DEFAULT '[]'::jsonb,
  cart JSONB DEFAULT '[]'::jsonb,
  wishlist JSONB DEFAULT '[]'::jsonb,
  prescription_history JSONB DEFAULT '[]'::jsonb,
  subscription JSONB DEFAULT '{}'::jsonb,
  state TEXT,
  city TEXT,
  address TEXT,
  street_address TEXT,
  experience_years INT DEFAULT 0,
  degrees TEXT,
  vci_registration TEXT,
  certifications TEXT,
  breeding_license TEXT,
  kennel_name TEXT,
  training_specialization TEXT,
  vehicle_types TEXT,
  emergency_helpline TEXT,
  grooming_schedule JSONB DEFAULT '{}'::jsonb,
  schedule JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- SECTION 2: E-COMMERCE (CATEGORIES, PRODUCTS, ORDERS, COUPONS, REVIEWS, PRESCRIPTIONS)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  icon TEXT,
  description TEXT,
  subcategories JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Products Table (Matches existing live Supabase schema)
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  brand TEXT,
  sku TEXT,
  price NUMERIC(10, 2) NOT NULL,
  discount_price NUMERIC(10, 2),
  stock INT DEFAULT 0,
  low_stock_threshold INT DEFAULT 5,
  description TEXT,
  long_description TEXT,
  category TEXT,
  subcategory TEXT,
  pet_type TEXT DEFAULT 'dogs',
  requires_prescription BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  is_bestseller BOOLEAN DEFAULT false,
  image TEXT,
  images JSONB DEFAULT '[]'::jsonb,
  ingredients JSONB DEFAULT '[]'::jsonb,
  specifications JSONB DEFAULT '{}'::jsonb,
  ratings JSONB DEFAULT '{"average": 4.5, "count": 0}'::jsonb,
  rating NUMERIC(3, 1) DEFAULT 4.5,
  num_reviews INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY DEFAULT ('ord_' || replace(gen_random_uuid()::text, '-', '')),
  order_number TEXT,
  user_id TEXT,
  customer JSONB DEFAULT '{}'::jsonb,
  order_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  shipping_address JSONB,
  payment_method TEXT DEFAULT 'COD',
  payment_status TEXT DEFAULT 'Pending',
  shipping_status TEXT DEFAULT 'Pending',
  subtotal NUMERIC(10, 2) DEFAULT 0,
  discount NUMERIC(10, 2) DEFAULT 0,
  coupon_code TEXT,
  tax NUMERIC(10, 2) DEFAULT 0,
  shipping NUMERIC(10, 2) DEFAULT 0,
  grand_total NUMERIC(10, 2) DEFAULT 0,
  pricing JSONB NOT NULL DEFAULT '{}'::jsonb,
  transaction_id TEXT,
  tracking_id TEXT,
  prescription_id TEXT,
  is_paid BOOLEAN DEFAULT false,
  payment_result JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.coupons (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  discount NUMERIC(10, 2) DEFAULT 0,
  discount_type TEXT DEFAULT 'percentage',
  discount_value NUMERIC(10, 2) DEFAULT 10,
  min_order_value NUMERIC(10, 2) DEFAULT 0,
  max_discount NUMERIC(10, 2),
  expiry_date TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  usage_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.reviews (
  id TEXT PRIMARY KEY DEFAULT ('rev_' || replace(gen_random_uuid()::text, '-', '')),
  product_id TEXT NOT NULL,
  user_id TEXT,
  user_name TEXT,
  rating NUMERIC(3, 1) NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  comment TEXT,
  verified_purchase BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.prescriptions (
  id TEXT PRIMARY KEY DEFAULT ('prx_' || replace(gen_random_uuid()::text, '-', '')),
  user_id TEXT,
  file_url TEXT NOT NULL,
  notes TEXT,
  doctor_name TEXT,
  patient_name TEXT,
  clinic_name TEXT,
  status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected', 'Under Review')),
  remarks TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.blogs (
  id TEXT PRIMARY KEY DEFAULT ('blg_' || replace(gen_random_uuid()::text, '-', '')),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  summary TEXT,
  content TEXT NOT NULL,
  author TEXT DEFAULT 'JOSH PETS HUB Editorial Team',
  featured_image TEXT,
  pet_type TEXT DEFAULT 'dogs',
  tags JSONB DEFAULT '[]'::jsonb,
  read_time TEXT DEFAULT '5 min read',
  faqs JSONB DEFAULT '[]'::jsonb,
  related_products JSONB DEFAULT '[]'::jsonb,
  is_published BOOLEAN DEFAULT true,
  published_date TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- SECTION 3: SERVICE PROVIDER & MARKETPLACE SERVICES
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.services (
  id TEXT PRIMARY KEY DEFAULT ('srv_' || replace(gen_random_uuid()::text, '-', '')),
  provider_id TEXT,
  provider_name TEXT,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  discount_price NUMERIC(10, 2),
  price_unit TEXT DEFAULT 'per session',
  duration TEXT DEFAULT '60 min',
  pet_types JSONB DEFAULT '["dog", "cat"]'::jsonb,
  service_mode TEXT DEFAULT 'center',
  location TEXT,
  state TEXT,
  city TEXT,
  area TEXT,
  contact_phone TEXT,
  contact_whatsapp TEXT,
  description TEXT,
  highlights JSONB DEFAULT '[]'::jsonb,
  packages JSONB DEFAULT '[]'::jsonb,
  images JSONB DEFAULT '[]'::jsonb,
  rating NUMERIC(3, 1) DEFAULT 5.0,
  reviews_count INT DEFAULT 0,
  status TEXT DEFAULT 'Active',
  is_verified BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.bookings (
  id TEXT PRIMARY KEY DEFAULT ('bkg_' || replace(gen_random_uuid()::text, '-', '')),
  user_id TEXT,
  service_type TEXT NOT NULL,
  provider_name TEXT,
  location TEXT,
  booking_date DATE,
  date TEXT,
  time_slot TEXT,
  pet_details JSONB DEFAULT '{}'::jsonb,
  fee NUMERIC(10, 2),
  total_amount NUMERIC(10, 2),
  status TEXT DEFAULT 'Confirmed',
  payment_status TEXT DEFAULT 'Pending',
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.listings (
  id TEXT PRIMARY KEY DEFAULT ('lst_' || replace(gen_random_uuid()::text, '-', '')),
  user_id TEXT,
  title TEXT,
  pet_name TEXT NOT NULL,
  pet_type TEXT,
  breed TEXT,
  age TEXT,
  gender TEXT,
  price NUMERIC(10, 2),
  quantity INT DEFAULT 1,
  location TEXT,
  photos JSONB DEFAULT '[]'::jsonb,
  images JSONB DEFAULT '[]'::jsonb,
  description TEXT,
  contact_phone TEXT,
  is_verified BOOLEAN DEFAULT false,
  vaccination_certificate TEXT,
  payment_status TEXT DEFAULT 'Pending',
  payment_amount NUMERIC(10, 2) DEFAULT 0,
  status TEXT DEFAULT 'Active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.breedings (
  id TEXT PRIMARY KEY DEFAULT ('brd_' || replace(gen_random_uuid()::text, '-', '')),
  user_id TEXT,
  stud_name TEXT NOT NULL,
  pet_type TEXT DEFAULT 'dog',
  breed TEXT NOT NULL,
  age TEXT,
  kci_number TEXT,
  stud_fee NUMERIC(10, 2),
  description TEXT,
  images JSONB DEFAULT '[]'::jsonb,
  pedigree_details JSONB DEFAULT '{}'::jsonb,
  location TEXT,
  contact_phone TEXT,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.adoptions (
  id TEXT PRIMARY KEY DEFAULT ('adp_' || replace(gen_random_uuid()::text, '-', '')),
  shelter_name TEXT,
  shelter_location TEXT,
  pet_name TEXT NOT NULL,
  pet_type TEXT DEFAULT 'dog',
  breed TEXT,
  age TEXT,
  rescue_story TEXT,
  image TEXT,
  health_status TEXT,
  adoption_fee NUMERIC(10, 2) DEFAULT 0,
  inquiries INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- SECTION 4: PLATFORM, FINANCE & AUDITING
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.enquiries (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'Pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.messages (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  sender_id TEXT NOT NULL,
  recipient_id TEXT NOT NULL,
  message_text TEXT NOT NULL,
  listing_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.notifications (
  id TEXT PRIMARY KEY DEFAULT ('notif_' || replace(gen_random_uuid()::text, '-', '')),
  recipient_type TEXT DEFAULT 'user',
  recipient_id TEXT,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  read BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Cookie Consents Table (Matches existing live Supabase schema)
CREATE TABLE IF NOT EXISTS public.cookie_consents (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  session_id TEXT UNIQUE,
  preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.announcements (
  id TEXT PRIMARY KEY DEFAULT ('anc_' || replace(gen_random_uuid()::text, '-', '')),
  badge TEXT DEFAULT 'HOT OFFER',
  badge_color TEXT DEFAULT 'rose',
  icon TEXT DEFAULT '📢',
  text TEXT NOT NULL,
  link TEXT DEFAULT '/shop',
  cta_text TEXT DEFAULT 'Shop Now',
  highlight BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  display_order INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.provider_payouts (
  id TEXT PRIMARY KEY DEFAULT ('pay_' || replace(gen_random_uuid()::text, '-', '')),
  provider_id TEXT NOT NULL,
  provider_email TEXT,
  provider_name TEXT,
  service_category TEXT,
  amount NUMERIC(10, 2) NOT NULL,
  payout_method TEXT DEFAULT 'upi',
  upi_id TEXT,
  status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Processing', 'Completed', 'Rejected')),
  bank_details JSONB DEFAULT '{}'::jsonb,
  requested_at TIMESTAMPTZ DEFAULT now(),
  processed_at TIMESTAMPTZ,
  admin_notes TEXT,
  transfer_reference TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.platform_wallet_ledger (
  id TEXT PRIMARY KEY DEFAULT ('led_' || replace(gen_random_uuid()::text, '-', '')),
  type TEXT NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  booking_id TEXT,
  provider_id TEXT,
  provider_name TEXT,
  service_category TEXT,
  customer_id TEXT,
  customer_name TEXT,
  platform_fee NUMERIC(10, 2) DEFAULT 0,
  provider_share NUMERIC(10, 2) DEFAULT 0,
  payment_id TEXT,
  order_id TEXT,
  utr TEXT,
  status TEXT DEFAULT 'Recorded',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.provider_bank_accounts (
  id TEXT PRIMARY KEY DEFAULT ('bnk_' || replace(gen_random_uuid()::text, '-', '')),
  provider_id TEXT UNIQUE NOT NULL,
  provider_email TEXT,
  provider_name TEXT,
  account_holder TEXT,
  bank_name TEXT,
  account_number_masked TEXT,
  account_number_encrypted TEXT,
  ifsc TEXT,
  is_verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.financial_audit_logs (
  id TEXT PRIMARY KEY DEFAULT ('flog_' || replace(gen_random_uuid()::text, '-', '')),
  timestamp TIMESTAMPTZ DEFAULT now(),
  action TEXT NOT NULL,
  actor TEXT,
  ref_id TEXT,
  amount NUMERIC(10, 2),
  status TEXT,
  details TEXT
);

-- ==============================================================================
-- SECTION 5: ENTERPRISE CRM MODULES (ROLES, USERS, TICKETS, TASKS, LEADS, REFUNDS, INCIDENTS)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.crm_roles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  department TEXT NOT NULL,
  color TEXT DEFAULT 'indigo',
  is_system BOOLEAN DEFAULT false,
  permissions JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.crm_users (
  id TEXT PRIMARY KEY DEFAULT ('crm_usr_' || replace(gen_random_uuid()::text, '-', '')),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  phone TEXT,
  role_id TEXT REFERENCES public.crm_roles(id) ON DELETE SET NULL,
  role_name TEXT,
  department TEXT,
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.crm_tickets (
  id TEXT PRIMARY KEY DEFAULT ('tkt_' || replace(gen_random_uuid()::text, '-', '')),
  ticket_number TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  subject TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  priority TEXT DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High', 'Urgent')),
  status TEXT DEFAULT 'Open' CHECK (status IN ('Open', 'In Progress', 'Resolved', 'Closed')),
  assigned_to TEXT,
  assigned_to_id TEXT,
  messages JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.crm_tasks (
  id TEXT PRIMARY KEY DEFAULT ('tsk_' || replace(gen_random_uuid()::text, '-', '')),
  title TEXT NOT NULL,
  description TEXT,
  assigned_to TEXT,
  customer_name TEXT,
  customer_phone TEXT,
  due_date TIMESTAMPTZ,
  priority TEXT DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High')),
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.crm_leads (
  id TEXT PRIMARY KEY DEFAULT ('lead_' || replace(gen_random_uuid()::text, '-', '')),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  pet_interest TEXT,
  source TEXT DEFAULT 'Website Direct',
  budget NUMERIC(10, 2) DEFAULT 0,
  stage TEXT DEFAULT 'New' CHECK (stage IN ('New', 'Contacted', 'Qualified', 'Proposal Sent', 'Converted', 'Lost')),
  priority TEXT DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High')),
  assigned_to TEXT,
  assigned_to_id TEXT,
  notes JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.crm_refunds (
  id TEXT PRIMARY KEY DEFAULT ('ref_' || replace(gen_random_uuid()::text, '-', '')),
  order_id TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  reason TEXT,
  payment_method TEXT DEFAULT 'UPI / Card',
  status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Processed', 'Rejected')),
  requested_at TIMESTAMPTZ DEFAULT now(),
  reviewed_by TEXT,
  review_remarks TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.crm_incidents (
  id TEXT PRIMARY KEY DEFAULT ('inc_' || replace(gen_random_uuid()::text, '-', '')),
  title TEXT NOT NULL,
  service TEXT,
  severity TEXT DEFAULT 'Low' CHECK (severity IN ('Low', 'Medium', 'High', 'Critical')),
  status TEXT DEFAULT 'Open' CHECK (status IN ('Open', 'Under Investigation', 'Resolved')),
  details TEXT,
  logged_by TEXT,
  timestamp TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- SECTION 6: ROW LEVEL SECURITY (RLS) & OPEN ACCESS POLICIES
-- ==============================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.breedings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.adoptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cookie_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_wallet_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_incidents ENABLE ROW LEVEL SECURITY;

-- Helper to grant full read/write access to authenticated and service roles
DO $$
DECLARE
  t TEXT;
  tbls TEXT[] := ARRAY[
    'users', 'categories', 'products', 'orders', 'coupons', 'reviews',
    'prescriptions', 'blogs', 'services', 'bookings', 'listings', 'breedings',
    'adoptions', 'enquiries', 'messages', 'notifications', 'cookie_consents',
    'announcements', 'provider_payouts', 'platform_wallet_ledger',
    'provider_bank_accounts', 'financial_audit_logs', 'crm_roles',
    'crm_users', 'crm_tickets', 'crm_tasks', 'crm_leads', 'crm_refunds',
    'crm_incidents'
  ];
BEGIN
  FOREACH t IN ARRAY tbls LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Public access on %I" ON public.%I', t, t);
    EXECUTE format('CREATE POLICY "Public access on %I" ON public.%I FOR ALL USING (true) WITH CHECK (true)', t, t);
  END LOOP;
END $$;

-- Enable Supabase Realtime publication on crucial tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.crm_tickets;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

