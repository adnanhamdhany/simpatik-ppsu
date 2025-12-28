-- Revised Fix RLS Policy for Avatars
-- Explicitly drop ALL potential conflicting policies first

-- Drop policies if they exist (handling potential naming conflicts)
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read" ON storage.objects;
DROP POLICY IF EXISTS "Allow public update" ON storage.objects;

-- Create permissive policy for avatars bucket
-- 1. INSERT (Upload)
CREATE POLICY "Allow public uploads"
ON storage.objects FOR INSERT
TO public
WITH CHECK ( bucket_id = 'avatars' );

-- 2. SELECT (Read)
CREATE POLICY "Allow public read"
ON storage.objects FOR SELECT
TO public
USING ( bucket_id = 'avatars' );

-- 3. UPDATE (Upsert/Replace)
CREATE POLICY "Allow public update"
ON storage.objects FOR UPDATE
TO public
USING ( bucket_id = 'avatars' );
