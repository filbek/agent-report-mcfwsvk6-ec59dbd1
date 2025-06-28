/*
  # Create Sample Data for Testing

  1. Sample Agents
    - Creates 4 test agents (Adviye, Jennifer, Çiğdem, Hande)
    - 2 Yurtdışı and 2 Yurtiçi agents
    - Uses safe insertion to avoid duplicates

  2. Sample Reports
    - Creates realistic performance data for 4 months
    - Each agent gets 4 weeks of data per month (16 reports total)
    - Generates realistic metrics with proper relationships
    - Uses existence checks to avoid duplicates
*/

-- Insert sample agents (safe to run multiple times)
DO $$
BEGIN
    -- Insert Adviye if not exists
    IF NOT EXISTS (SELECT 1 FROM agents WHERE name = 'Adviye') THEN
        INSERT INTO agents (name, category, email, notes, active) 
        VALUES ('Adviye', 'Yurtdışı', 'adviye@test.com', 'Deneyimli yurtdışı agent', true);
    END IF;
    
    -- Insert Jennifer if not exists
    IF NOT EXISTS (SELECT 1 FROM agents WHERE name = 'Jennifer') THEN
        INSERT INTO agents (name, category, email, notes, active) 
        VALUES ('Jennifer', 'Yurtdışı', 'jennifer@test.com', 'İngilizce konuşan agent', true);
    END IF;
    
    -- Insert Çiğdem if not exists
    IF NOT EXISTS (SELECT 1 FROM agents WHERE name = 'Çiğdem') THEN
        INSERT INTO agents (name, category, email, notes, active) 
        VALUES ('Çiğdem', 'Yurtiçi', 'cigdem@test.com', 'Yurtiçi operasyon uzmanı', true);
    END IF;
    
    -- Insert Hande if not exists
    IF NOT EXISTS (SELECT 1 FROM agents WHERE name = 'Hande') THEN
        INSERT INTO agents (name, category, email, notes, active) 
        VALUES ('Hande', 'Yurtiçi', 'hande@test.com', 'Müşteri ilişkileri uzmanı', true);
    END IF;
    
    RAISE NOTICE 'Sample agents created successfully';
END $$;

-- Create sample reports for each agent
DO $$
DECLARE
    agent_record RECORD;
    month_name TEXT;
    week_num INTEGER;
    report_date DATE;
    base_data INTEGER;
    contacted_count INTEGER;
    appointments_count INTEGER;
    unreachable_count INTEGER;
    no_answer_count INTEGER;
    rejected_count INTEGER;
    negative_count INTEGER;
    month_idx INTEGER;
BEGIN
    -- Loop through each agent
    FOR agent_record IN SELECT id, name FROM agents WHERE name IN ('Adviye', 'Jennifer', 'Çiğdem', 'Hande') LOOP
        -- Loop through months (May to August 2024)
        FOR month_idx IN 1..4 LOOP
            CASE month_idx
                WHEN 1 THEN month_name := 'Mayıs';
                WHEN 2 THEN month_name := 'Haziran';
                WHEN 3 THEN month_name := 'Temmuz';
                WHEN 4 THEN month_name := 'Ağustos';
            END CASE;
            
            -- Loop through weeks
            FOR week_num IN 1..4 LOOP
                -- Calculate report date
                report_date := ('2024-' || LPAD((4 + month_idx)::TEXT, 2, '0') || '-' || LPAD((week_num * 7)::TEXT, 2, '0'))::DATE;
                
                -- Check if report already exists for this agent and date
                IF NOT EXISTS (
                    SELECT 1 FROM reports 
                    WHERE agent_id = agent_record.id 
                    AND date = report_date
                ) THEN
                    -- Generate realistic random data
                    base_data := 50 + floor(random() * 100)::INTEGER;
                    contacted_count := floor(base_data * (0.5 + random() * 0.3))::INTEGER;
                    unreachable_count := floor(random() * 15)::INTEGER;
                    no_answer_count := floor(random() * 20)::INTEGER;
                    rejected_count := floor(random() * 10)::INTEGER;
                    negative_count := floor(random() * 5)::INTEGER;
                    appointments_count := floor(contacted_count * (0.1 + random() * 0.2))::INTEGER;
                    
                    -- Ensure data consistency (contacted should not exceed incoming_data)
                    IF contacted_count > base_data THEN
                        contacted_count := base_data;
                    END IF;
                    
                    -- Insert report
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
                        report_date,
                        month_name,
                        week_num,
                        base_data,
                        contacted_count,
                        unreachable_count,
                        no_answer_count,
                        rejected_count,
                        negative_count,
                        appointments_count
                    );
                    
                    RAISE NOTICE 'Created report for % - % Week %', agent_record.name, month_name, week_num;
                END IF;
            END LOOP;
        END LOOP;
    END LOOP;
    
    RAISE NOTICE 'Sample reports creation completed successfully';
END $$;

-- Verify the data was created
DO $$
DECLARE
    agent_count INTEGER;
    report_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO agent_count FROM agents WHERE name IN ('Adviye', 'Jennifer', 'Çiğdem', 'Hande');
    SELECT COUNT(*) INTO report_count FROM reports WHERE agent_id IN (
        SELECT id FROM agents WHERE name IN ('Adviye', 'Jennifer', 'Çiğdem', 'Hande')
    );
    
    RAISE NOTICE 'Sample data verification: % agents, % reports created', agent_count, report_count;
END $$;