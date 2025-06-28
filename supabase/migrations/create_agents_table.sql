/*
  # Create agents table for health tourism agents

  1. New Tables
    - `agents`
      - `id` (uuid, primary key)
      - `name` (text, agent name)
      - `category` (text, enum: Yurtdışı, Yurtiçi)
      - `email` (text, optional)
      - `notes` (text, optional)
      - `active` (boolean, default true)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `agents` table
    - Add policies for authenticated users to read agents
    - Add policies for admins to manage agents
*/

CREATE TABLE IF NOT EXISTS agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL CHECK (category IN ('Yurtdışı', 'Yurtiçi')),
  email text,
  notes text DEFAULT '',
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE agents ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read agents
CREATE POLICY "Authenticated users can read agents"
  ON agents
  FOR SELECT
  TO authenticated
  USING (true);

-- Only admins can insert agents
CREATE POLICY "Admins can insert agents"
  ON agents
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can update agents
CREATE POLICY "Admins can update agents"
  ON agents
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can delete agents
CREATE POLICY "Admins can delete agents"
  ON agents
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Add trigger for updated_at
CREATE TRIGGER update_agents_updated_at
  BEFORE UPDATE ON agents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create unique index on name for better performance
CREATE UNIQUE INDEX IF NOT EXISTS agents_name_unique_idx ON agents(name);