-- Update existing Petugas and Koordinator users with a random team
-- Teams: 'wilayah', 'penyapuan', 'crm'
-- Cast to "Petugas Team" enum type

UPDATE public."user"
SET role_petugas_team = ((ARRAY['wilayah', 'penyapuan', 'crm'])[floor(random() * 3 + 1)])::"Petugas Team"
WHERE role IN ('petugas', 'koordinator');
