/*
  # Add sample reports data

  1. Sample Data
    - Create sample reports for existing agents
    - Cover multiple months and weeks
    - Realistic performance data

  2. Data Structure
    - Reports for both Yurtdışı and Yurtiçi agents
    - Multiple weeks of data
    - Varied performance metrics
*/

-- Insert sample reports data
INSERT INTO reports (agent_id, date, month, week, incoming_data, contacted, unreachable, no_answer, rejected, negative, appointments)
SELECT 
  a.id,
  CURRENT_DATE - (random() * 30)::integer,
  CASE 
    WHEN random() < 0.25 THEN 'Mayıs'
    WHEN random() < 0.5 THEN 'Haziran'
    WHEN random() < 0.75 THEN 'Temmuz'
    ELSE 'Ağustos'
  END,
  (random() * 4 + 1)::integer,
  (random() * 100 + 20)::integer,
  (random() * 80 + 10)::integer,
  (random() * 20 + 5)::integer,
  (random() * 15 + 5)::integer,
  (random() * 10 + 2)::integer,
  (random() * 8 + 1)::integer,
  (random() * 15 + 3)::integer
FROM agents a
WHERE a.active = true;

-- Add more sample data for better visualization
INSERT INTO reports (agent_id, date, month, week, incoming_data, contacted, unreachable, no_answer, rejected, negative, appointments)
SELECT 
  a.id,
  CURRENT_DATE - (random() * 60 + 30)::integer,
  CASE 
    WHEN random() < 0.25 THEN 'Mayıs'
    WHEN random() < 0.5 THEN 'Haziran'
    WHEN random() < 0.75 THEN 'Temmuz'
    ELSE 'Ağustos'
  END,
  (random() * 4 + 1)::integer,
  (random() * 120 + 30)::integer,
  (random() * 90 + 15)::integer,
  (random() * 25 + 8)::integer,
  (random() * 18 + 7)::integer,
  (random() * 12 + 3)::integer,
  (random() * 10 + 2)::integer,
  (random() * 18 + 5)::integer
FROM agents a
WHERE a.active = true;