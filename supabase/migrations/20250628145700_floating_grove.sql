/*
  # Final Data Fix Migration

  1. Tables Setup
    - Ensure all tables exist with proper structure
    - Clear any conflicting data
    - Set up proper constraints and indexes

  2. Sample Data
    - Insert comprehensive agent data
    - Insert realistic report data for multiple months
    - Ensure data integrity

  3. Security
    - Proper RLS policies
    - Correct permissions for all user roles
*/

-- Drop existing data to start fresh
TRUNCATE TABLE reports CASCADE;
TRUNCATE TABLE agents CASCADE;

-- Ensure agents table has proper structure
CREATE TABLE IF NOT EXISTS agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  category text NOT NULL CHECK (category IN ('Yurtdışı', 'Yurtiçi')),
  email text,
  notes text DEFAULT '',
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Ensure reports table has proper structure
CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
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
      WHEN incoming_data > 0 THEN ((appointments::numeric / incoming_data::numeric) * 100)
      ELSE 0
    END
  ) STORED,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reports_agent_id ON reports(agent_id);
CREATE INDEX IF NOT EXISTS idx_reports_date ON reports(date);
CREATE INDEX IF NOT EXISTS idx_reports_month ON reports(month);
CREATE INDEX IF NOT EXISTS idx_agents_category ON agents(category);
CREATE INDEX IF NOT EXISTS idx_agents_active ON agents(active);

-- RLS Policies for agents
DROP POLICY IF EXISTS "Authenticated users can read agents" ON agents;
DROP POLICY IF EXISTS "Admins can insert agents" ON agents;
DROP POLICY IF EXISTS "Admins can update agents" ON agents;
DROP POLICY IF EXISTS "Admins can delete agents" ON agents;

CREATE POLICY "Authenticated users can read agents" ON agents
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can insert agents" ON agents
  FOR INSERT TO authenticated 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update agents" ON agents
  FOR UPDATE TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete agents" ON agents
  FOR DELETE TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- RLS Policies for reports
DROP POLICY IF EXISTS "Authenticated users can read reports" ON reports;
DROP POLICY IF EXISTS "Admins can insert reports" ON reports;
DROP POLICY IF EXISTS "Admins can update reports" ON reports;
DROP POLICY IF EXISTS "Admins can delete reports" ON reports;

CREATE POLICY "Authenticated users can read reports" ON reports
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can insert reports" ON reports
  FOR INSERT TO authenticated 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update reports" ON reports
  FOR UPDATE TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete reports" ON reports
  FOR DELETE TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Insert Yurtdışı agents
INSERT INTO agents (name, category, email, notes, active) VALUES
('Adviye', 'Yurtdışı', 'adviye@saglikturizmi.com', 'Yurtdışı operasyonları uzmanı', true),
('Cengiz Yurtdışı', 'Yurtdışı', 'cengiz.yurtdisi@saglikturizmi.com', 'Avrupa bölgesi sorumlusu', true),
('Dilara', 'Yurtdışı', 'dilara@saglikturizmi.com', 'Amerika bölgesi sorumlusu', true),
('Enedelya', 'Yurtdışı', 'enedelya@saglikturizmi.com', 'Asya bölgesi sorumlusu', true),
('Jennifer', 'Yurtdışı', 'jennifer@saglikturizmi.com', 'İngilizce konuşan müşteriler', true),
('Merve', 'Yurtdışı', 'merve@saglikturizmi.com', 'Orta Doğu bölgesi sorumlusu', true),
('Nadia', 'Yurtdışı', 'nadia@saglikturizmi.com', 'Afrika bölgesi sorumlusu', true),
('Nour', 'Yurtdışı', 'nour@saglikturizmi.com', 'Arapça konuşan müşteriler', true);

-- Insert Yurtiçi agents
INSERT INTO agents (name, category, email, notes, active) VALUES
('Cengiz Yurtiçi', 'Yurtiçi', 'cengiz.yurtici@saglikturizmi.com', 'Yurtiçi operasyonları', true),
('Çiğdem', 'Yurtiçi', 'cigdem@saglikturizmi.com', 'İstanbul bölgesi sorumlusu', true),
('Hande', 'Yurtiçi', 'hande@saglikturizmi.com', 'Ankara bölgesi sorumlusu', true),
('Hilal', 'Yurtiçi', 'hilal@saglikturizmi.com', 'İzmir bölgesi sorumlusu', true),
('Nazlı', 'Yurtiçi', 'nazli@saglikturizmi.com', 'Antalya bölgesi sorumlusu', true),
('Saliha', 'Yurtiçi', 'saliha@saglikturizmi.com', 'Bursa bölgesi sorumlusu', true),
('Yekta Check Up', 'Yurtiçi', 'yekta@saglikturizmi.com', 'Check-up hizmetleri', true);

-- Insert Mayıs reports for Yurtdışı agents
WITH agent_data AS (
  SELECT 
    a.id as agent_id,
    data.incoming_data,
    data.contacted,
    data.unreachable,
    data.no_answer,
    data.rejected,
    data.negative,
    data.appointments
  FROM agents a
  JOIN (VALUES
    ('Adviye', 436, 263, 35, 138, 0, 0, 4),
    ('Cengiz Yurtdışı', 70, 37, 1, 20, 0, 12, 5),
    ('Dilara', 93, 33, 33, 22, 3, 2, 5),
    ('Enedelya', 119, 49, 32, 19, 0, 19, 5),
    ('Jennifer', 186, 71, 72, 42, 1, 0, 12),
    ('Merve', 614, 297, 38, 226, 19, 34, 2),
    ('Nadia', 1005, 519, 20, 307, 60, 99, 9),
    ('Nour', 159, 259, 115, 0, 0, 44, 6)
  ) AS data(name, incoming_data, contacted, unreachable, no_answer, rejected, negative, appointments)
  ON a.name = data.name AND a.category = 'Yurtdışı'
)
INSERT INTO reports (agent_id, date, month, week, incoming_data, contacted, unreachable, no_answer, rejected, negative, appointments)
SELECT 
  agent_id,
  '2024-05-01'::date,
  'Mayıs',
  1,
  incoming_data,
  contacted,
  unreachable,
  no_answer,
  rejected,
  negative,
  appointments
FROM agent_data;

-- Insert Haziran reports for Yurtdışı agents
WITH agent_data AS (
  SELECT 
    a.id as agent_id,
    data.incoming_data,
    data.contacted,
    data.unreachable,
    data.no_answer,
    data.rejected,
    data.negative,
    data.appointments
  FROM agents a
  JOIN (VALUES
    ('Adviye', 186, 93, 0, 0, 0, 0, 4),
    ('Cengiz Yurtdışı', 58, 43, 2, 13, 0, 4, 1),
    ('Dilara', 64, 31, 22, 11, 2, 1, 0),
    ('Enedelya', 102, 84, 16, 2, 0, 9, 8),
    ('Jennifer', 152, 76, 47, 29, 0, 0, 11),
    ('Merve', 515, 253, 96, 166, 24, 48, 5),
    ('Nadia', 682, 385, 20, 277, 45, 68, 5),
    ('Nour', 110, 36, 71, 3, 0, 35, 1)
  ) AS data(name, incoming_data, contacted, unreachable, no_answer, rejected, negative, appointments)
  ON a.name = data.name AND a.category = 'Yurtdışı'
)
INSERT INTO reports (agent_id, date, month, week, incoming_data, contacted, unreachable, no_answer, rejected, negative, appointments)
SELECT 
  agent_id,
  '2024-06-01'::date,
  'Haziran',
  1,
  incoming_data,
  contacted,
  unreachable,
  no_answer,
  rejected,
  negative,
  appointments
FROM agent_data;

-- Insert Mayıs reports for Yurtiçi agents
WITH agent_data AS (
  SELECT 
    a.id as agent_id,
    data.incoming_data,
    data.contacted,
    data.unreachable,
    data.no_answer,
    data.rejected,
    data.negative,
    data.appointments
  FROM agents a
  JOIN (VALUES
    ('Cengiz Yurtiçi', 408, 305, 61, 4, 40, 0, 6),
    ('Çiğdem', 373, 281, 79, 15, 12, 1, 15),
    ('Hande', 291, 206, 85, 25, 0, 0, 20),
    ('Hilal', 240, 115, 77, 20, 39, 9, 25),
    ('Nazlı', 198, 115, 76, 5, 5, 2, 0),
    ('Saliha', 378, 248, 125, 27, 5, 0, 28),
    ('Yekta Check Up', 158, 132, 1, 2, 0, 5, 71)
  ) AS data(name, incoming_data, contacted, unreachable, no_answer, rejected, negative, appointments)
  ON a.name = data.name AND a.category = 'Yurtiçi'
)
INSERT INTO reports (agent_id, date, month, week, incoming_data, contacted, unreachable, no_answer, rejected, negative, appointments)
SELECT 
  agent_id,
  '2024-05-01'::date,
  'Mayıs',
  1,
  incoming_data,
  contacted,
  unreachable,
  no_answer,
  rejected,
  negative,
  appointments
FROM agent_data;

-- Insert Haziran reports for Yurtiçi agents
WITH agent_data AS (
  SELECT 
    a.id as agent_id,
    data.incoming_data,
    data.contacted,
    data.unreachable,
    data.no_answer,
    data.rejected,
    data.negative,
    data.appointments
  FROM agents a
  JOIN (VALUES
    ('Cengiz Yurtiçi', 253, 173, 73, 12, 7, 0, 3),
    ('Çiğdem', 66, 37, 21, 1, 8, 0, 6),
    ('Hande', 182, 105, 37, 10, 40, 0, 16),
    ('Hilal', 150, 102, 28, 3, 20, 0, 10),
    ('Nazlı', 282, 223, 59, 3, 0, 0, 1),
    ('Saliha', 364, 236, 126, 7, 0, 2, 11),
    ('Yekta Check Up', 0, 0, 0, 0, 0, 0, 0)
  ) AS data(name, incoming_data, contacted, unreachable, no_answer, rejected, negative, appointments)
  ON a.name = data.name AND a.category = 'Yurtiçi'
)
INSERT INTO reports (agent_id, date, month, week, incoming_data, contacted, unreachable, no_answer, rejected, negative, appointments)
SELECT 
  agent_id,
  '2024-06-01'::date,
  'Haziran',
  1,
  incoming_data,
  contacted,
  unreachable,
  no_answer,
  rejected,
  negative,
  appointments
FROM agent_data;

-- Add Temmuz and Ağustos sample data for better testing
-- Temmuz reports for Yurtdışı agents
WITH agent_data AS (
  SELECT 
    a.id as agent_id,
    (random() * 300 + 100)::integer as incoming_data,
    (random() * 150 + 50)::integer as contacted,
    (random() * 40 + 10)::integer as unreachable,
    (random() * 60 + 20)::integer as no_answer,
    (random() * 20 + 5)::integer as rejected,
    (random() * 15 + 2)::integer as negative,
    (random() * 25 + 5)::integer as appointments
  FROM agents a
  WHERE a.category = 'Yurtdışı'
)
INSERT INTO reports (agent_id, date, month, week, incoming_data, contacted, unreachable, no_answer, rejected, negative, appointments)
SELECT 
  agent_id,
  '2024-07-01'::date,
  'Temmuz',
  1,
  incoming_data,
  contacted,
  unreachable,
  no_answer,
  rejected,
  negative,
  appointments
FROM agent_data;

-- Temmuz reports for Yurtiçi agents
WITH agent_data AS (
  SELECT 
    a.id as agent_id,
    (random() * 400 + 150)::integer as incoming_data,
    (random() * 200 + 80)::integer as contacted,
    (random() * 50 + 15)::integer as unreachable,
    (random() * 30 + 10)::integer as no_answer,
    (random() * 25 + 5)::integer as rejected,
    (random() * 10 + 2)::integer as negative,
    (random() * 35 + 10)::integer as appointments
  FROM agents a
  WHERE a.category = 'Yurtiçi'
)
INSERT INTO reports (agent_id, date, month, week, incoming_data, contacted, unreachable, no_answer, rejected, negative, appointments)
SELECT 
  agent_id,
  '2024-07-01'::date,
  'Temmuz',
  1,
  incoming_data,
  contacted,
  unreachable,
  no_answer,
  rejected,
  negative,
  appointments
FROM agent_data;

-- Ağustos reports for Yurtdışı agents
WITH agent_data AS (
  SELECT 
    a.id as agent_id,
    (random() * 250 + 80)::integer as incoming_data,
    (random() * 120 + 40)::integer as contacted,
    (random() * 30 + 8)::integer as unreachable,
    (random() * 50 + 15)::integer as no_answer,
    (random() * 15 + 3)::integer as rejected,
    (random() * 10 + 1)::integer as negative,
    (random() * 20 + 3)::integer as appointments
  FROM agents a
  WHERE a.category = 'Yurtdışı'
)
INSERT INTO reports (agent_id, date, month, week, incoming_data, contacted, unreachable, no_answer, rejected, negative, appointments)
SELECT 
  agent_id,
  '2024-08-01'::date,
  'Ağustos',
  1,
  incoming_data,
  contacted,
  unreachable,
  no_answer,
  rejected,
  negative,
  appointments
FROM agent_data;

-- Ağustos reports for Yurtiçi agents
WITH agent_data AS (
  SELECT 
    a.id as agent_id,
    (random() * 350 + 120)::integer as incoming_data,
    (random() * 180 + 70)::integer as contacted,
    (random() * 40 + 12)::integer as unreachable,
    (random() * 25 + 8)::integer as no_answer,
    (random() * 20 + 4)::integer as rejected,
    (random() * 8 + 1)::integer as negative,
    (random() * 30 + 8)::integer as appointments
  FROM agents a
  WHERE a.category = 'Yurtiçi'
)
INSERT INTO reports (agent_id, date, month, week, incoming_data, contacted, unreachable, no_answer, rejected, negative, appointments)
SELECT 
  agent_id,
  '2024-08-01'::date,
  'Ağustos',
  1,
  incoming_data,
  contacted,
  unreachable,
  no_answer,
  rejected,
  negative,
  appointments
FROM agent_data;

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_agents_updated_at ON agents;
CREATE TRIGGER update_agents_updated_at
  BEFORE UPDATE ON agents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_reports_updated_at ON reports;
CREATE TRIGGER update_reports_updated_at
  BEFORE UPDATE ON reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();