-- Migration: add profiles table and extend product table with category, status, stock, slug

-- 1) Create profiles table to store roles for auth users
-- Run as a Supabase SQL migration using the SQL editor or psql with the service role key

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text,
  role text NOT NULL DEFAULT 'user',
  created_at timestamptz DEFAULT now()
);

-- 2) Add columns to existing product table (safe ALTERs)
ALTER TABLE IF EXISTS public.product
  ADD COLUMN IF NOT EXISTS Category text DEFAULT 'other',
  ADD COLUMN IF NOT EXISTS Status text DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS Stock integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS Slug text;

-- 3) Create unique index on Slug (only for non-null slugs)
CREATE UNIQUE INDEX IF NOT EXISTS idx_product_slug_unique ON public.product (Slug) WHERE Slug IS NOT NULL;

-- 4) Row Level Security: enable RLS and create policies
-- IMPORTANT: Enable RLS only if you intend to enforce per-row policies.

-- Enable RLS on product table
ALTER TABLE public.product ENABLE ROW LEVEL SECURITY;

-- Allow public/select on active products for anonymous users
CREATE POLICY "allow_select_active_products" ON public.product
  FOR SELECT
  USING (Status = 'active');

-- Allow insert by admins only
CREATE POLICY "admins_can_insert" ON public.product
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Allow update by admins only
CREATE POLICY "admins_can_update" ON public.product
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Allow delete by admins only
CREATE POLICY "admins_can_delete" ON public.product
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- 5) Simple policy for profiles: allow users to insert their profile on signup and allow read for authenticated users
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Note: After running this migration, create a profile row for any admin account by inserting into public.profiles (id = auth.user().id, role = 'admin')

-- End of migration
