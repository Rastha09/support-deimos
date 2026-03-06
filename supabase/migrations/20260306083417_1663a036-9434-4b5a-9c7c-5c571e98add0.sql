
-- Add QRIS-specific columns and update donations table for QRISMU
ALTER TABLE public.donations 
  ADD COLUMN IF NOT EXISTS qris_url text,
  ADD COLUMN IF NOT EXISTS transaction_id text,
  ADD COLUMN IF NOT EXISTS fee integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS amount_received integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS paid_at timestamp with time zone;

-- Make reference nullable since QRISMU uses transaction_id
ALTER TABLE public.donations ALTER COLUMN reference DROP NOT NULL;
ALTER TABLE public.donations ALTER COLUMN reference SET DEFAULT '';
