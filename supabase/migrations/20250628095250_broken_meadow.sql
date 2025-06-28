/*
  # Fix agents table RLS policies

  1. Changes
    - Drop existing policies that reference missing is_admin function
    - Recreate policies using the newly created is_admin function

  2. Security
    - All authenticated users can read agents
    - Only admins can insert, update, and delete agents
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can insert agents" ON agents;
DROP POLICY IF EXISTS "Admins can update agents" ON agents;
DROP POLICY IF EXISTS "Admins can delete agents" ON agents;

-- Recreate policies with proper function reference
CREATE POLICY "Admins can insert agents"
  ON agents
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update agents"
  ON agents
  FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete agents"
  ON agents
  FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));