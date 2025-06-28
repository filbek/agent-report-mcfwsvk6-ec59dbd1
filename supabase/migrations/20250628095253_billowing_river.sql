/*
  # Fix reports table RLS policies

  1. Changes
    - Drop existing policies that reference missing is_admin function
    - Recreate policies using the newly created is_admin function

  2. Security
    - All authenticated users can read reports
    - Only admins can insert, update, and delete reports
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can insert reports" ON reports;
DROP POLICY IF EXISTS "Admins can update reports" ON reports;
DROP POLICY IF EXISTS "Admins can delete reports" ON reports;

-- Recreate policies with proper function reference
CREATE POLICY "Admins can insert reports"
  ON reports
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update reports"
  ON reports
  FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete reports"
  ON reports
  FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));