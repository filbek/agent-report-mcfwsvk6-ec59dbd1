/*
  # Make specific user admin

  1. Updates
    - Update the profile for user ID 'bccbe889-734e-4193-a91c-649b08c78634' to have admin role
    - If profile doesn't exist, create it with admin role

  2. Security
    - This is a one-time administrative action
*/

-- Update existing profile to admin role, or insert if it doesn't exist
INSERT INTO profiles (user_id, role, full_name)
VALUES ('bccbe889-734e-4193-a91c-649b08c78634', 'admin', 'Admin User')
ON CONFLICT (user_id) 
DO UPDATE SET 
  role = 'admin',
  updated_at = now();