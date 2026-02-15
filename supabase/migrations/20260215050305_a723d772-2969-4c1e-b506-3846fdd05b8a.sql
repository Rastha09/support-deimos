-- Allow public read of donation status by merchant_order_id
CREATE POLICY "Public can check donation status by order id"
ON public.donations
FOR SELECT
USING (true);