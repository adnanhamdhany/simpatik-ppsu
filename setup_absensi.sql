-- 1. Create 'absensi' bucket (Public)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('absensi', 'absensi', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Create 'absensi' table
CREATE TABLE IF NOT EXISTS public.absensi (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id BIGINT REFERENCES public."user"(id) NOT NULL,
    image_path TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    approved_by BIGINT REFERENCES public."user"(id)
);

-- 3. Storage Policies (Permissive for Custom Auth)
-- Allow public uploads (secured by API)
DROP POLICY IF EXISTS "Allow public uploads absensi" ON storage.objects;
CREATE POLICY "Allow public uploads absensi"
ON storage.objects FOR INSERT
TO public
WITH CHECK ( bucket_id = 'absensi' );

-- Allow public read
DROP POLICY IF EXISTS "Allow public read absensi" ON storage.objects;
CREATE POLICY "Allow public read absensi"
ON storage.objects FOR SELECT
TO public
USING ( bucket_id = 'absensi' );
