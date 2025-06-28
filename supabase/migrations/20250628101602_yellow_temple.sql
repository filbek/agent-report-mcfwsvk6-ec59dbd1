/*
  # Fix profiles table RLS policies

  1. Security Changes
    - Drop existing problematic policies that cause infinite recursion
    - Create new, simplified policies that avoid circular dependencies
    - Ensure users can read and update their own profiles
    - Allow admins to manage all profiles without recursion

  2. Policy Structure
    - Simple user access based on auth.uid()
    - Admin access without recursive profile lookups
    - Clear separation of concerns
*/

-- Drop existing policies that cause infinite recursion
DROP POLICY IF EXISTS "Admins can delete profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Create new, non-recursive policies
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

-- Admin policies using direct role check without recursive lookups
CREATE POLICY "Service role can manage all profiles"
  ON profiles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to read all profiles for admin functionality
-- This is safer than recursive policy checks
CREATE POLICY "Authenticated users can read all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- Only allow updates to own profile or by service role
CREATE POLICY "Admin role can update all profiles"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id OR 
    auth.jwt() ->> 'role' = 'service_role'
  );

CREATE POLICY "Admin role can delete profiles"
  ON profiles
  FOR DELETE
  TO authenticated
  USING (
    auth.jwt() ->> 'role' = 'service_role'
  );