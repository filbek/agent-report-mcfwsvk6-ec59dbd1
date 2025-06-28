/*
  # Create Sample Data for Testing

  1. Purpose
    - Creates sample agents and reports for testing
    - Provides realistic data for dashboard functionality
    - Ensures the application has data to display

  2. Sample Data
    - 4 sample agents (2 Yurtdışı, 2 Yurtiçi)
    - Multiple reports for each agent across different months
    - Realistic performance metrics

  3. Safety
    - Uses INSERT ... ON CONFLICT DO NOTHING to avoid duplicates
    - Safe to run multiple times
*/

-- Insert sample agents (safe to run multiple times)
INSERT INTO agents (name, category, email, notes, active) VALUES
('Adviye', 'Yurtdışı', 'adviye@test.com', 'Deneyimli yurtdışı agent', true),
('Jennifer', 'Yurtdışı', 'jennifer@test.com', 'İngilizce konuşan agent', true),
('Çiğdem', 'Yurtiçi', 'cigdem@test.com', 'Yurtiçi operasyon uzmanı', true),
('Hande', 'Yurtiçi', 'hande@test.com', 'Müşteri ilişkileri uzmanı', true)
ON CONFLICT (name) DO NOTHING;

-- Create sample reports for each agent
DO $$
DECLARE
    agent_record RECORD;
    month_name TEXT;
    week_num INTEGER;
    base_data INTEGER;
    contacted_count INTEGER;
    appointments_count INTEGER;
BEGIN
    -- Loop through each agent
    FOR agent_record IN SELECT id, name FROM agents WHERE name IN ('Adviye', 'Jennifer', 'Çiğdem', 'Hande') LOOP
        -- Loop through months
        FOR month_idx IN 1..4 LOOP
            CASE month_idx
                WHEN 1 THEN month_name := 'Mayıs';
                WHEN 2 THEN month_name := 'Haziran';
                WHEN 3 THEN month_name := 'Temmuz';
                WHEN 4 THEN month_name := 'Ağustos';
            END CASE;
            
            -- Loop through weeks
            FOR week_num IN 1..4 LOOP
                -- Generate realistic random data
                base_data := 50 + floor(random() * 100)::INTEGER;
                contacted_count := floor(base_data * (0.5 + random() * 0.3))::INTEGER;
                appointments_count := floor(contacted_count * (0.1 + random() * 0.2))::INTEGER;
                
                -- Insert report (avoid duplicates)
                INSERT INTO reports (
                    agent_id,
                    date,
                    month,
                    week,
                    incoming_data,
                    contacted,
                    unreachable,
                    no_answer,
                    rejected,
                    negative,
                    appointments
                ) VALUES (
                    agent_record.id,
                    ('2024-' || LPAD((4 + month_idx)::TEXT, 2, '0') || '-' || LPAD((week_num * 7)::TEXT, 2, '0'))::DATE,
                    month_name,
                    week_num,
                    base_data,
                    contacted_count,
                    floor(random() * 15)::INTEGER,
                    floor(random() * 20)::INTEGER,
                    floor(random() * 10)::INTEGER,
                    floor(random() * 5)::INTEGER,
                    appointments_count
                ) ON CONFLICT (agent_id, date) DO NOTHING;
            END LOOP;
        END LOOP;
    END LOOP;
    
    RAISE NOTICE 'Sample data creation completed successfully';
END $$;