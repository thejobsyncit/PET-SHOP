-- ==============================================================================
-- JOSH PETS HUB (PAWORA) - SUPABASE POSTGRESQL SCHEMA MIGRATION
-- Run this SQL in your Supabase SQL Editor (https://supabase.com/dashboard/project/chkaqdokgyppcadfkoce/sql)
-- ==============================================================================

-- 1. Users Table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT,
  role TEXT DEFAULT 'CUSTOMER' CHECK (role IN ('CUSTOMER', 'ADMIN', 'SERVICE_PROVIDER', 'SUPERADMIN')),
  mobile TEXT,
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
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  icon TEXT,
  description TEXT,
  subcategories JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Products Table
CREATE TABLE IF NOT EXISTS public.products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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
  rating NUMERIC(3, 1) DEFAULT 4.5,
  num_reviews INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  order_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  shipping_address JSONB,
  payment_method TEXT DEFAULT 'COD',
  payment_status TEXT DEFAULT 'Pending',
  shipping_status TEXT DEFAULT 'Processing',
  pricing JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Enquiries Table
CREATE TABLE IF NOT EXISTS public.enquiries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'Pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Classified Listings Table
CREATE TABLE IF NOT EXISTS public.listings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
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

-- 7. Service Bookings Table
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  service_type TEXT NOT NULL,
  provider_name TEXT,
  booking_date DATE,
  time_slot TEXT,
  status TEXT DEFAULT 'Confirmed',
  total_amount NUMERIC(10, 2),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Cookie Consents Table
CREATE TABLE IF NOT EXISTS public.cookie_consents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT,
  ip_address TEXT,
  consent_state JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security (RLS) & Public read policies
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read on products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Allow public read on categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Allow public read on listings" ON public.listings FOR SELECT USING (true);
