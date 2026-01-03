-- Supabase Storage setup (buckets + optional policies)
-- Run in Supabase SQL Editor *after* enabling Storage.

-- Buckets used by this app
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('erp-uploads', 'erp-uploads', false),
  ('erp-evidencias', 'erp-evidencias', false),
  ('erp-pdfs', 'erp-pdfs', false)
ON CONFLICT (id) DO NOTHING;

-- NOTE:
-- Policies depend on whether you use Supabase Auth for end-users.
-- If your backend uploads using the Service Role key, you can keep buckets private and skip public policies.
-- If you want authenticated users to read/write directly, uncomment policies below.

-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- -- Allow authenticated read
-- CREATE POLICY "auth read erp-uploads" ON storage.objects
--   FOR SELECT TO authenticated
--   USING (bucket_id = 'erp-uploads');
--
-- -- Allow authenticated write
-- CREATE POLICY "auth write erp-uploads" ON storage.objects
--   FOR INSERT TO authenticated
--   WITH CHECK (bucket_id = 'erp-uploads');
--
-- -- Repeat policies for other buckets as needed:
-- -- bucket_id IN ('erp-evidencias','erp-pdfs')
