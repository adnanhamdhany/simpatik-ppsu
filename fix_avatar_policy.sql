-- Fix RLS Policy for Avatars
-- Since we use Custom Auth, users are "anon" to Supabase Storage RLS.
-- We must allow public inserts, relying on our API/Application logic for security.

-- Drop existing policies if they exist (to avoid errors if run multiple times or conflicts)
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects;

-- Create permissive policy for avatars bucket
CREATE POLICY "Allow public uploads"
ON storage.objects FOR INSERT
TO public
WITH CHECK ( bucket_id = 'avatars' );

-- Ensure select is also public
DROP POLICY IF EXISTS "Allow public read" ON storage.objects;
CREATE POLICY "Allow public read"
ON storage.objects FOR SELECT
TO public
USING ( bucket_id = 'avatars' );

-- Also allow update just in case (upsert uses update sometimes)
DROP POLICY IF EXISTS "Allow public update" ON storage.objects;
CREATE POLICY "Allow public update"
ON storage.objects FOR UPDATE
TO public
USING ( bucket_id = 'avatars' );
