-- ==============================================================================
-- JOSH PETS HUB - COMPLETE SUPABASE POSTGRESQL SCHEMA MIGRATION
-- Run this SQL in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/chkaqdokgyppcadfkoce/sql
-- ==============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Users Table
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT,
  role TEXT DEFAULT 'CUSTOMER' CHECK (role IN ('CUSTOMER', 'ADMIN', 'SERVICE_PROVIDER', 'SUPERADMIN')),
  mobile TEXT,
  phone TEXT,
  whatsapp TEXT,
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
  subscription JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  icon TEXT,
  description TEXT,
  subcategories JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Products Table (Schema check - preserves existing data)
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
  is_best_seller BOOLEAN DEFAULT false,
  image TEXT,
  images JSONB DEFAULT '[]'::jsonb,
  ingredients JSONB DEFAULT '[]'::jsonb,
  specifications JSONB DEFAULT '{}'::jsonb,
  rating NUMERIC(3, 1) DEFAULT 4.5,
  num_reviews INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY DEFAULT ('ord_' || replace(gen_random_uuid()::text, '-', '')),
  user_id TEXT,
  order_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  shipping_address JSONB,
  payment_method TEXT DEFAULT 'COD',
  payment_status TEXT DEFAULT 'Pending',
  shipping_status TEXT DEFAULT 'Processing',
  pricing JSONB NOT NULL DEFAULT '{}'::jsonb,
  transaction_id TEXT,
  prescription_id TEXT,
  is_paid BOOLEAN DEFAULT false,
  payment_result JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Blogs Table
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

-- 6. Prescriptions Table
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

-- 7. Reviews Table
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

-- 8. Coupons Table
CREATE TABLE IF NOT EXISTS public.coupons (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  code TEXT UNIQUE NOT NULL,
  discount NUMERIC(10, 2) NOT NULL,
  expiry_date TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  min_order_value NUMERIC(10, 2) DEFAULT 0,
  max_discount NUMERIC(10, 2),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 9. Classified Listings Table (Pet Marketplace)
CREATE TABLE IF NOT EXISTS public.listings (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT,
  pet_name TEXT NOT NULL,
  pet_type TEXT,
  breed TEXT,
  age TEXT,
  gender TEXT,
  price NUMERIC(10, 2),
  location TEXT,
  photos JSONB DEFAULT '[]'::jsonb,
  description TEXT,
  status TEXT DEFAULT 'Active',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 10. Service Bookings Table (Hostel, Vet, Grooming, Walking)
CREATE TABLE IF NOT EXISTS public.bookings (
  id TEXT PRIMARY KEY DEFAULT ('bkg_' || replace(gen_random_uuid()::text, '-', '')),
  user_id TEXT,
  service_type TEXT NOT NULL,
  provider_name TEXT,
  booking_date DATE,
  time_slot TEXT,
  status TEXT DEFAULT 'Confirmed',
  payment_status TEXT DEFAULT 'Pending',
  total_amount NUMERIC(10, 2),
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 11. Breeding / Stud Services Table
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
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 12. Adoptions Table
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
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 13. Enquiries / Contact Us Table
CREATE TABLE IF NOT EXISTS public.enquiries (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'Pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 14. Chat Messages Table
CREATE TABLE IF NOT EXISTS public.messages (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  sender_id TEXT NOT NULL,
  recipient_id TEXT NOT NULL,
  message_text TEXT NOT NULL,
  listing_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 15. Cookie Consents Table (Already exists, verified)
CREATE TABLE IF NOT EXISTS public.cookie_consents (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  session_id TEXT UNIQUE,
  preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 16. Announcements Table (Top Auto-Scrolling Header Offers)
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

-- ------------------------------------------------------------------------------
-- Enable Row Level Security (RLS) on all tables
-- ------------------------------------------------------------------------------
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.breedings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.adoptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cookie_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- Allow Anon/Service Public Access Policies (Matching Backend Service Keys)
-- ------------------------------------------------------------------------------
DO $$
BEGIN
  -- Products
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public products read' AND tablename = 'products') THEN
    CREATE POLICY "Public products read" ON public.products FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public products write' AND tablename = 'products') THEN
    CREATE POLICY "Public products write" ON public.products FOR ALL USING (true) WITH CHECK (true);
  END IF;

  -- Categories
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public categories read' AND tablename = 'categories') THEN
    CREATE POLICY "Public categories read" ON public.categories FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public categories write' AND tablename = 'categories') THEN
    CREATE POLICY "Public categories write" ON public.categories FOR ALL USING (true) WITH CHECK (true);
  END IF;

  -- Blogs
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public blogs read' AND tablename = 'blogs') THEN
    CREATE POLICY "Public blogs read" ON public.blogs FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public blogs write' AND tablename = 'blogs') THEN
    CREATE POLICY "Public blogs write" ON public.blogs FOR ALL USING (true) WITH CHECK (true);
  END IF;

  -- Users
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users access' AND tablename = 'users') THEN
    CREATE POLICY "Users access" ON public.users FOR ALL USING (true) WITH CHECK (true);
  END IF;

  -- Orders
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Orders access' AND tablename = 'orders') THEN
    CREATE POLICY "Orders access" ON public.orders FOR ALL USING (true) WITH CHECK (true);
  END IF;

  -- Prescriptions
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Prescriptions access' AND tablename = 'prescriptions') THEN
    CREATE POLICY "Prescriptions access" ON public.prescriptions FOR ALL USING (true) WITH CHECK (true);
  END IF;

  -- Reviews
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Reviews access' AND tablename = 'reviews') THEN
    CREATE POLICY "Reviews access" ON public.reviews FOR ALL USING (true) WITH CHECK (true);
  END IF;

  -- Coupons
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Coupons access' AND tablename = 'coupons') THEN
    CREATE POLICY "Coupons access" ON public.coupons FOR ALL USING (true) WITH CHECK (true);
  END IF;

  -- Listings
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Listings access' AND tablename = 'listings') THEN
    CREATE POLICY "Listings access" ON public.listings FOR ALL USING (true) WITH CHECK (true);
  END IF;

  -- Bookings
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Bookings access' AND tablename = 'bookings') THEN
    CREATE POLICY "Bookings access" ON public.bookings FOR ALL USING (true) WITH CHECK (true);
  END IF;

  -- Breedings
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Breedings access' AND tablename = 'breedings') THEN
    CREATE POLICY "Breedings access" ON public.breedings FOR ALL USING (true) WITH CHECK (true);
  END IF;

  -- Adoptions
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Adoptions access' AND tablename = 'adoptions') THEN
    CREATE POLICY "Adoptions access" ON public.adoptions FOR ALL USING (true) WITH CHECK (true);
  END IF;

  -- Enquiries
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Enquiries access' AND tablename = 'enquiries') THEN
    CREATE POLICY "Enquiries access" ON public.enquiries FOR ALL USING (true) WITH CHECK (true);
  END IF;

  -- Messages
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Messages access' AND tablename = 'messages') THEN
    CREATE POLICY "Messages access" ON public.messages FOR ALL USING (true) WITH CHECK (true);
  END IF;

  -- Cookie Consents
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Cookie consents access' AND tablename = 'cookie_consents') THEN
    CREATE POLICY "Cookie consents access" ON public.cookie_consents FOR ALL USING (true) WITH CHECK (true);
  END IF;

  -- Announcements
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public announcements read' AND tablename = 'announcements') THEN
    CREATE POLICY "Public announcements read" ON public.announcements FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public announcements write' AND tablename = 'announcements') THEN
    CREATE POLICY "Public announcements write" ON public.announcements FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;
