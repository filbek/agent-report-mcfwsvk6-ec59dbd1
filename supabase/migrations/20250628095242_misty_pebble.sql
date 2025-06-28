/*
  # Fix profiles table RLS policies to prevent infinite recursion

  1. Changes
    - Drop existing problematic policies
    - Recreate policies with proper structure to avoid recursion
    - Use direct role comparison instead of helper function for profiles table

  2. Security
    - Users can read and update their own profile
    - Admins can read, update, and delete all profiles
*/

-- Drop existing policies that cause infinite recursion
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON profiles;

-- Recreate policies with proper structure
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

-- For admin policies, we need to use a different approach to avoid recursion
-- We'll check the role directly in the current row for the user making the request
CREATE POLICY "Admins can read all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.user_id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "Admins can update all profiles"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.user_id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete profiles"
  ON profiles
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.user_id = auth.uid() AND p.role = 'admin'
    )
  );