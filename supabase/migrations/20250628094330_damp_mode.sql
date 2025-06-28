/*
  # Create reports table for agent performance tracking

  1. New Tables
    - `reports`
      - `id` (uuid, primary key)
      - `agent_id` (uuid, foreign key to agents)
      - `date` (date)
      - `month` (text)
      - `week` (integer)
      - `incoming_data` (integer, default 0)
      - `contacted` (integer, default 0)
      - `unreachable` (integer, default 0)
      - `no_answer` (integer, default 0)
      - `rejected` (integer, default 0)
      - `negative` (integer, default 0)
      - `appointments` (integer, default 0)
      - `sales_rate` (numeric, default 0)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `reports` table
    - Add policies for authenticated users to read reports
    - Add policies for admins to manage reports
*/

CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid REFERENCES agents(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  month text NOT NULL DEFAULT '',
  week integer NOT NULL DEFAULT 1,
  incoming_data integer DEFAULT 0,
  contacted integer DEFAULT 0,
  unreachable integer DEFAULT 0,
  no_answer integer DEFAULT 0,
  rejected integer DEFAULT 0,
  negative integer DEFAULT 0,
  appointments integer DEFAULT 0,
  sales_rate numeric(5,2) DEFAULT 0.0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read reports
CREATE POLICY "Authenticated users can read reports"
  ON reports
  FOR SELECT
  TO authenticated
  USING (true);

-- Only admins can insert reports
CREATE POLICY "Admins can insert reports"
  ON reports
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

-- Only admins can update reports
CREATE POLICY "Admins can update reports"
  ON reports
  FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- Only admins can delete reports
CREATE POLICY "Admins can delete reports"
  ON reports
  FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- Add trigger for updated_at
CREATE TRIGGER update_reports_updated_at
  BEFORE UPDATE ON reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS reports_agent_id_idx ON reports(agent_id);
CREATE INDEX IF NOT EXISTS reports_date_idx ON reports(date);
CREATE INDEX IF NOT EXISTS reports_month_idx ON reports(month);
CREATE INDEX IF NOT EXISTS reports_week_idx ON reports(week);