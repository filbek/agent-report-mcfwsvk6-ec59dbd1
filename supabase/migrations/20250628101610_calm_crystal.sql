/*
  # Create reports table

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
      - `sales_rate` (numeric, computed)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `reports` table
    - Add policies for authenticated users to read reports
    - Add policies for admins to manage reports

  3. Relationships
    - Foreign key constraint linking reports to agents
    - Proper indexing for performance
*/

CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  month text NOT NULL,
  week integer NOT NULL,
  incoming_data integer DEFAULT 0,
  contacted integer DEFAULT 0,
  unreachable integer DEFAULT 0,
  no_answer integer DEFAULT 0,
  rejected integer DEFAULT 0,
  negative integer DEFAULT 0,
  appointments integer DEFAULT 0,
  sales_rate numeric GENERATED ALWAYS AS (
    CASE 
      WHEN incoming_data > 0 THEN (appointments::numeric / incoming_data::numeric) * 100
      ELSE 0
    END
  ) STORED,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add foreign key constraint
ALTER TABLE reports 
ADD CONSTRAINT fk_reports_agent_id 
FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reports_agent_id ON reports(agent_id);
CREATE INDEX IF NOT EXISTS idx_reports_date ON reports(date);
CREATE INDEX IF NOT EXISTS idx_reports_month ON reports(month);
CREATE INDEX IF NOT EXISTS idx_reports_week ON reports(week);

-- Enable RLS
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Authenticated users can read reports"
  ON reports
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert reports"
  ON reports
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update reports"
  ON reports
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete reports"
  ON reports
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_reports_updated_at
  BEFORE UPDATE ON reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();