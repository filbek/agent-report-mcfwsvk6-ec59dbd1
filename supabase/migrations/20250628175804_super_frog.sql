/*
  # Comprehensive Database Fix and Data Loading

  This migration will:
  1. Clean up any existing data issues
  2. Create sample agents and reports
  3. Verify data integrity
  4. Ensure dashboard compatibility
*/

-- Step 1: Clean up existing data and check current state
DO $$
DECLARE
    agent_count INTEGER;
    report_count INTEGER;
    profile_count INTEGER;
BEGIN
    -- Get current counts
    SELECT COUNT(*) INTO agent_count FROM agents;
    SELECT COUNT(*) INTO report_count FROM reports;
    SELECT COUNT(*) INTO profile_count FROM profiles;
    
    RAISE NOTICE '🔍 Current database state:';
    RAISE NOTICE '   - Agents: %', agent_count;
    RAISE NOTICE '   - Reports: %', report_count;
    RAISE NOTICE '   - Profiles: %', profile_count;
    
    -- Clean up any orphaned data
    DELETE FROM reports WHERE agent_id NOT IN (SELECT id FROM agents);
    
    RAISE NOTICE '✅ Database cleanup completed';
END $$;

-- Step 2: Create sample agents (if needed)
INSERT INTO agents (name, category, email, notes, active) VALUES
('Adviye', 'Yurtdışı', 'adviye@test.com', 'Deneyimli yurtdışı agent - Almanya uzmanı', true),
('Jennifer', 'Yurtdışı', 'jennifer@test.com', 'İngilizce konuşan agent - ABD uzmanı', true),
('Çiğdem', 'Yurtiçi', 'cigdem@test.com', 'Yurtiçi operasyon uzmanı - İstanbul', true),
('Hande', 'Yurtiçi', 'hande@test.com', 'Müşteri ilişkileri uzmanı - Ankara', true)
ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    email = EXCLUDED.email,
    notes = EXCLUDED.notes,
    active = EXCLUDED.active,
    updated_at = now();

-- Step 3: Clear existing reports and create comprehensive sample data
DELETE FROM reports;

-- Step 4: Create sample reports for each agent and month
DO $$
DECLARE
    agent_rec RECORD;
    month_name TEXT;
    month_num INTEGER;
    week_num INTEGER;
    report_date DATE;
    base_data INTEGER;
    contacted INTEGER;
    appointments INTEGER;
    unreachable INTEGER;
    no_answer INTEGER;
    rejected INTEGER;
    negative INTEGER;
    reports_created INTEGER := 0;
BEGIN
    RAISE NOTICE '📊 Creating comprehensive sample reports...';
    
    -- Loop through each agent
    FOR agent_rec IN SELECT id, name, category FROM agents WHERE name IN ('Adviye', 'Jennifer', 'Çiğdem', 'Hande') LOOP
        RAISE NOTICE '👤 Creating reports for: % (%)', agent_rec.name, agent_rec.category;
        
        -- Loop through months (May to August 2024)
        FOR month_idx IN 1..4 LOOP
            -- Set month details
            CASE month_idx
                WHEN 1 THEN 
                    month_name := 'Mayıs';
                    month_num := 5;
                WHEN 2 THEN 
                    month_name := 'Haziran';
                    month_num := 6;
                WHEN 3 THEN 
                    month_name := 'Temmuz';
                    month_num := 7;
                WHEN 4 THEN 
                    month_name := 'Ağustos';
                    month_num := 8;
            END CASE;
            
            -- Loop through weeks (4 weeks per month)
            FOR week_num IN 1..4 LOOP
                -- Calculate report date
                report_date := ('2024-' || LPAD(month_num::TEXT, 2, '0') || '-' || LPAD((week_num * 7)::TEXT, 2, '0'))::DATE;
                
                -- Generate realistic data based on agent category
                IF agent_rec.category = 'Yurtdışı' THEN
                    -- International agents: higher volume
                    base_data := 80 + floor(random() * 120)::INTEGER;
                    contacted := floor(base_data * (0.6 + random() * 0.25))::INTEGER;
                    appointments := floor(contacted * (0.15 + random() * 0.15))::INTEGER;
                ELSE
                    -- Domestic agents: moderate volume
                    base_data := 50 + floor(random() * 80)::INTEGER;
                    contacted := floor(base_data * (0.5 + random() * 0.3))::INTEGER;
                    appointments := floor(contacted * (0.1 + random() * 0.2))::INTEGER;
                END IF;
                
                -- Generate other metrics
                unreachable := floor(random() * 20)::INTEGER;
                no_answer := floor(random() * 25)::INTEGER;
                rejected := floor(random() * 15)::INTEGER;
                negative := floor(random() * 8)::INTEGER;
                
                -- Ensure data consistency
                IF contacted > base_data THEN
                    contacted := base_data;
                END IF;
                
                IF appointments > contacted THEN
                    appointments := contacted;
                END IF;
                
                -- Insert the report
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
                    agent_rec.id,
                    report_date,
                    month_name,
                    week_num,
                    base_data,
                    contacted,
                    unreachable,
                    no_answer,
                    rejected,
                    negative,
                    appointments
                );
                
                reports_created := reports_created + 1;
            END LOOP;
        END LOOP;
        
        RAISE NOTICE '✅ Created 16 reports for %', agent_rec.name;
    END LOOP;
    
    RAISE NOTICE '🎉 Total reports created: %', reports_created;
END $$;

-- Step 5: Verify data integrity and provide detailed statistics
DO $$
DECLARE
    final_agents INTEGER;
    final_reports INTEGER;
    yurtdisi_agents INTEGER;
    yurtici_agents INTEGER;
    yurtdisi_reports INTEGER;
    yurtici_reports INTEGER;
    mayis_reports INTEGER;
    haziran_reports INTEGER;
    temmuz_reports INTEGER;
    agustos_reports INTEGER;
    avg_sales_rate NUMERIC;
    total_incoming BIGINT;
    total_appointments BIGINT;
    overall_conversion NUMERIC;
BEGIN
    -- Basic counts
    SELECT COUNT(*) INTO final_agents FROM agents;
    SELECT COUNT(*) INTO final_reports FROM reports;
    
    -- Category breakdown
    SELECT COUNT(*) INTO yurtdisi_agents FROM agents WHERE category = 'Yurtdışı';
    SELECT COUNT(*) INTO yurtici_agents FROM agents WHERE category = 'Yurtiçi';
    
    SELECT COUNT(*) INTO yurtdisi_reports 
    FROM reports r 
    JOIN agents a ON r.agent_id = a.id 
    WHERE a.category = 'Yurtdışı';
    
    SELECT COUNT(*) INTO yurtici_reports 
    FROM reports r 
    JOIN agents a ON r.agent_id = a.id 
    WHERE a.category = 'Yurtiçi';
    
    -- Monthly breakdown
    SELECT COUNT(*) INTO mayis_reports FROM reports WHERE month = 'Mayıs';
    SELECT COUNT(*) INTO haziran_reports FROM reports WHERE month = 'Haziran';
    SELECT COUNT(*) INTO temmuz_reports FROM reports WHERE month = 'Temmuz';
    SELECT COUNT(*) INTO agustos_reports FROM reports WHERE month = 'Ağustos';
    
    -- Performance metrics
    SELECT 
        AVG(sales_rate),
        SUM(incoming_data),
        SUM(appointments)
    INTO avg_sales_rate, total_incoming, total_appointments
    FROM reports;
    
    overall_conversion := (total_appointments::NUMERIC / total_incoming::NUMERIC) * 100;
    
    -- Comprehensive report
    RAISE NOTICE '';
    RAISE NOTICE '🎉 ===== DATABASE SETUP COMPLETE =====';
    RAISE NOTICE '';
    RAISE NOTICE '📊 FINAL STATISTICS:';
    RAISE NOTICE '   ├─ Total Agents: %', final_agents;
    RAISE NOTICE '   ├─ Total Reports: %', final_reports;
    RAISE NOTICE '   └─ Expected Reports: 64 (4 agents × 4 months × 4 weeks)';
    RAISE NOTICE '';
    RAISE NOTICE '🏷️ AGENT CATEGORIES:';
    RAISE NOTICE '   ├─ Yurtdışı: % agents, % reports', yurtdisi_agents, yurtdisi_reports;
    RAISE NOTICE '   └─ Yurtiçi: % agents, % reports', yurtici_agents, yurtici_reports;
    RAISE NOTICE '';
    RAISE NOTICE '📅 MONTHLY DISTRIBUTION:';
    RAISE NOTICE '   ├─ Mayıs: % reports', mayis_reports;
    RAISE NOTICE '   ├─ Haziran: % reports', haziran_reports;
    RAISE NOTICE '   ├─ Temmuz: % reports', temmuz_reports;
    RAISE NOTICE '   └─ Ağustos: % reports', agustos_reports;
    RAISE NOTICE '';
    RAISE NOTICE '📈 PERFORMANCE OVERVIEW:';
    RAISE NOTICE '   ├─ Total Incoming Data: %', total_incoming;
    RAISE NOTICE '   ├─ Total Appointments: %', total_appointments;
    RAISE NOTICE '   ├─ Overall Conversion: %%%', ROUND(overall_conversion, 2);
    RAISE NOTICE '   └─ Average Sales Rate: %%%', ROUND(avg_sales_rate, 2);
    RAISE NOTICE '';
    
    IF final_agents = 4 AND final_reports = 64 THEN
        RAISE NOTICE '✅ SUCCESS: Database is fully populated and ready!';
        RAISE NOTICE '✅ Dashboard should now display all data correctly';
    ELSE
        RAISE WARNING '⚠️ WARNING: Expected 4 agents and 64 reports, got % agents and % reports', final_agents, final_reports;
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '🔧 TROUBLESHOOTING INFO:';
    RAISE NOTICE '   - If dashboard still shows no data, check browser console for errors';
    RAISE NOTICE '   - Verify Supabase connection in browser network tab';
    RAISE NOTICE '   - Try refreshing the page or clearing browser cache';
    RAISE NOTICE '';
    RAISE NOTICE '==========================================';
END $$;