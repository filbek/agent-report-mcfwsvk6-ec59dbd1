-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON profiles;
DROP POLICY IF EXISTS "Service role can manage all profiles" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Admin role can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Admin role can delete profiles" ON profiles;

-- Create simple, non-recursive policies
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow all authenticated users to read all profiles (needed for admin functionality)
CREATE POLICY "Authenticated users can read all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- Service role has full access
CREATE POLICY "Service role can manage all profiles"
  ON profiles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Update the specific user to admin role
UPDATE profiles 
SET role = 'admin', updated_at = now() 
WHERE user_id = 'bccbe889-734e-4193-a91c-649b08c78634';

-- If the profile doesn't exist, create it
INSERT INTO profiles (user_id, role, full_name)
VALUES ('bccbe889-734e-4193-a91c-649b08c78634', 'admin', 'Admin User')
ON CONFLICT (user_id) 
DO UPDATE SET 
  role = 'admin',
  updated_at = now();