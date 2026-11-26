-- ==============================================================================
-- JOSH PETS HUB - SEPARATE TABLES FOR USERS AND SERVICE PROVIDERS
-- Run this script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/chkaqdokgyppcadfkoce/sql/new
-- ==============================================================================

-- 1. Create the dedicated service_providers table cloned from users schema
CREATE TABLE IF NOT EXISTS public.service_providers (
  LIKE public.users INCLUDING ALL
);

-- 2. Migrate existing Service Providers from public.users into public.service_providers
INSERT INTO public.service_providers
SELECT * FROM public.users
WHERE role = 'SERVICE_PROVIDER'
ON CONFLICT DO NOTHING;

-- 3. Delete Service Providers from public.users so users table ONLY contains Customers & Admins
DELETE FROM public.users
WHERE role = 'SERVICE_PROVIDER';

-- 4. Ensure additional aliases and columns exist on service_providers & users
ALTER TABLE public.service_providers
  ADD COLUMN IF NOT EXISTS whatsapp_country_code TEXT DEFAULT '+91',
  ADD COLUMN IF NOT EXISTS mobile_country_code TEXT DEFAULT '+91',
  ADD COLUMN IF NOT EXISTS addresses JSONB DEFAULT '[]'::jsonb;

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS addresses JSONB DEFAULT '[]'::jsonb;

-- 5. Enable Row Level Security (RLS) on service_providers
ALTER TABLE public.service_providers ENABLE ROW LEVEL SECURITY;

-- 6. Configure Public Access Policies for service_providers
DROP POLICY IF EXISTS "Allow public read on service_providers" ON public.service_providers;
CREATE POLICY "Allow public read on service_providers" ON public.service_providers FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert on service_providers" ON public.service_providers;
CREATE POLICY "Allow public insert on service_providers" ON public.service_providers FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update on service_providers" ON public.service_providers;
CREATE POLICY "Allow public update on service_providers" ON public.service_providers FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public delete on service_providers" ON public.service_providers;
CREATE POLICY "Allow public delete on service_providers" ON public.service_providers FOR DELETE USING (true);

-- 7. Performance indexes
CREATE INDEX IF NOT EXISTS idx_service_providers_email ON public.service_providers(email);
CREATE INDEX IF NOT EXISTS idx_service_providers_category ON public.service_providers(service_category);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
