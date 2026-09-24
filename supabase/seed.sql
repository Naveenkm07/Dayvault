-- This seed file can be run against local development environments only.
-- Requires an existing user in auth.users to link these to. Assuming a test user UUID of 00000000-0000-0000-0000-000000000000 for illustration, 
-- but in practice replace this with your development user's ID or use Supabase Studio to insert.

-- DO NOT RUN IN PRODUCTION.

INSERT INTO daily_entries (id, user_id, entry_date, title, description, mood)
VALUES 
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', '2026-07-01', 'Started New Project', 'Began work on Dayvault!', '🤩 Excited'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', '2026-07-05', 'College Work', 'Finished the networking assignment', '🙂 Good'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', '2026-08-12', 'Project Development', 'Set up Supabase authentication', '😐 Neutral'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', '2026-09-20', 'Interview Preparation', 'Practiced leetcode and system design', '😔 Low');
