/*
  # Create is_admin helper function and fix RLS policies

  1. New Functions
    - `public.is_admin(user_id)` - Helper function to check if a user is admin

  2. Security
    - This function will be used by other table policies to check admin status
    - Function is marked as SECURITY DEFINER to run with elevated privileges
*/

-- Create the is_admin helper function
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = $1 AND profiles.role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated;