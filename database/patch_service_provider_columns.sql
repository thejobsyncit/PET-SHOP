-- ==============================================================================
-- JOSH PETS HUB - SERVICE PROVIDER & PROFILE ENHANCEMENT PATCH
-- Run this in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/chkaqdokgyppcadfkoce/sql/new
-- ==============================================================================

-- 1. Users Table: Add missing columns for Service Providers & Profile Updates
ALTER TABLE public.users 
  ADD COLUMN IF NOT EXISTS prescription_history JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS state TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS street_address TEXT,
  ADD COLUMN IF NOT EXISTS experience_years INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS experienceYears INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS degrees TEXT,
  ADD COLUMN IF NOT EXISTS vci_registration TEXT,
  ADD COLUMN IF NOT EXISTS vciRegistration TEXT,
  ADD COLUMN IF NOT EXISTS certifications TEXT,
  ADD COLUMN IF NOT EXISTS breeding_license TEXT,
  ADD COLUMN IF NOT EXISTS breedingLicense TEXT,
  ADD COLUMN IF NOT EXISTS kennel_name TEXT,
  ADD COLUMN IF NOT EXISTS kennelName TEXT,
  ADD COLUMN IF NOT EXISTS training_specialization TEXT,
  ADD COLUMN IF NOT EXISTS trainingSpecialization TEXT,
  ADD COLUMN IF NOT EXISTS vehicle_types TEXT,
  ADD COLUMN IF NOT EXISTS vehicleTypes TEXT,
  ADD COLUMN IF NOT EXISTS emergency_helpline TEXT,
  ADD COLUMN IF NOT EXISTS emergencyHelpline TEXT,
  ADD COLUMN IF NOT EXISTS grooming_schedule JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS groomingSchedule JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS schedule JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS capacity INT DEFAULT 50,
  ADD COLUMN IF NOT EXISTS "businessName" TEXT,
  ADD COLUMN IF NOT EXISTS "serviceCategory" TEXT,
  ADD COLUMN IF NOT EXISTS "govtProofType" TEXT,
  ADD COLUMN IF NOT EXISTS "govtProofNumber" TEXT,
  ADD COLUMN IF NOT EXISTS "govtProofDoc" TEXT,
  ADD COLUMN IF NOT EXISTS "verificationStatus" TEXT DEFAULT 'Verified',
  ADD COLUMN IF NOT EXISTS "shelterCapacity" INT DEFAULT 50,
  ADD COLUMN IF NOT EXISTS "profilePicture" TEXT,
  ADD COLUMN IF NOT EXISTS "whatsappNumber" TEXT;

-- 2. Services Table: Add camelCase and provider compatibility columns
ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS provider TEXT,
  ADD COLUMN IF NOT EXISTS "providerName" TEXT,
  ADD COLUMN IF NOT EXISTS "discountPrice" NUMERIC(10, 2),
  ADD COLUMN IF NOT EXISTS "priceUnit" TEXT DEFAULT 'per session',
  ADD COLUMN IF NOT EXISTS "petTypes" JSONB DEFAULT '["dog", "cat"]'::jsonb,
  ADD COLUMN IF NOT EXISTS "serviceMode" TEXT DEFAULT 'center',
  ADD COLUMN IF NOT EXISTS "contactPhone" TEXT,
  ADD COLUMN IF NOT EXISTS "contactWhatsapp" TEXT,
  ADD COLUMN IF NOT EXISTS "reviewsCount" INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "isVerified" BOOLEAN DEFAULT true;

-- 3. Bookings Table: Add camelCase compatibility columns
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS "userId" TEXT,
  ADD COLUMN IF NOT EXISTS "user" TEXT,
  ADD COLUMN IF NOT EXISTS "serviceType" TEXT,
  ADD COLUMN IF NOT EXISTS "providerName" TEXT,
  ADD COLUMN IF NOT EXISTS "timeSlot" TEXT,
  ADD COLUMN IF NOT EXISTS "petDetails" JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS "totalAmount" NUMERIC(10, 2),
  ADD COLUMN IF NOT EXISTS "paymentStatus" TEXT DEFAULT 'Pending';

