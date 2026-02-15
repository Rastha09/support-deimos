-- Drop the restrictive admin SELECT policy that blocks non-admin reads
DROP POLICY "Admins can view all donations" ON public.donations;