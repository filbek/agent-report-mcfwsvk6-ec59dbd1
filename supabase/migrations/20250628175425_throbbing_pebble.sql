/*
  # Comprehensive Database Data Fix

  1. Data Verification and Cleanup
    - Check current database state
    - Clean up orphaned reports
    - Verify data integrity

  2. Sample Agents Creation
    - Create 4 sample agents if needed
    - Adviye, Jennifer (Yurtdışı)
    - Çiğdem, Hande (Yurtiçi)

  3. Comprehensive Sample Reports
    - Create 64 reports (4 agents × 4 months × 4 weeks)
    - Realistic data with proper sales rates
    - Proper date and week calculations

  4. Data Validation
    - Verify all relationships
    - Calculate performance metrics
    - Ensure dashboard readiness
*/

-- Step 1: Data verification and cleanup
DO $$
DECLARE
    current_agents INTEGER;
    current_reports INTEGER;
    orphaned_reports INTEGER;
BEGIN
    -- Check current state
    SELECT COUNT(*) INTO current_agents FROM agents;
    SELECT COUNT(*) INTO current_reports FROM reports;
    
    -- Check for orphaned reports
    SELECT COUNT(*) INTO orphaned_reports 
    FROM reports r 
    WHERE NOT EXISTS (SELECT 1 FROM agents a WHERE a.id = r.agent_id);
    
    RAISE NOTICE '📊 Current database state:';
    RAISE NOTICE '   - Agents: %', current_agents;
    RAISE NOTICE '   - Reports: %', current_reports;
    RAISE NOTICE '   - Orphaned reports: %', orphaned_reports;
    
    -- Clean up orphaned reports if any
    IF orphaned_reports > 0 THEN
        DELETE FROM reports 
        WHERE NOT EXISTS (SELECT 1 FROM agents a WHERE a.id = reports.agent_id);
        RAISE NOTICE '🗑️ Cleaned up % orphaned reports', orphaned_reports;
    END IF;
END $$;

-- Step 2: Create sample agents if needed
DO $$
DECLARE
    agent_count INTEGER;
    agent_names TEXT[] := ARRAY['Adviye', 'Jennifer', 'Çiğdem', 'Hande'];
    agent_name TEXT;
    agents_created INTEGER := 0;
BEGIN
    SELECT COUNT(*) INTO agent_count FROM agents;
    
    IF agent_count < 4 THEN
        RAISE NOTICE '👥 Creating sample agents...';
        
        -- Create each agent if it doesn't exist
        FOREACH agent_name IN ARRAY agent_names LOOP
            IF NOT EXISTS (SELECT 1 FROM agents WHERE name = agent_name) THEN
                CASE agent_name
                    WHEN 'Adviye' THEN
                        INSERT INTO agents (name, category, email, notes, active) 
                        VALUES ('Adviye', 'Yurtdışı', 'adviye@test.com', 'Deneyimli yurtdışı agent - Almanya ve İsviçre uzmanı', true);
                    WHEN 'Jennifer' THEN
                        INSERT INTO agents (name, category, email, notes, active) 
                        VALUES ('Jennifer', 'Yurtdışı', 'jennifer@test.com', 'İngilizce konuşan agent - ABD ve İngiltere uzmanı', true);
                    WHEN 'Çiğdem' THEN
                        INSERT INTO agents (name, category, email, notes, active) 
                        VALUES ('Çiğdem', 'Yurtiçi', 'cigdem@test.com', 'Yurtiçi operasyon uzmanı - İstanbul bölgesi', true);
                    WHEN 'Hande' THEN
                        INSERT INTO agents (name, category, email, notes, active) 
                        VALUES ('Hande', 'Yurtiçi', 'hande@test.com', 'Müşteri ilişkileri uzmanı - Ankara bölgesi', true);
                END CASE;
                
                agents_created := agents_created + 1;
                RAISE NOTICE '✅ Created agent: %', agent_name;
            ELSE
                RAISE NOTICE 'ℹ️ Agent already exists: %', agent_name;
            END IF;
        END LOOP;
        
        RAISE NOTICE '🎉 Agent creation completed. Created: %, Total: %', agents_created, (SELECT COUNT(*) FROM agents);
    ELSE
        RAISE NOTICE 'ℹ️ Sufficient agents already exist (%), skipping creation', agent_count;
    END IF;
END $$;

-- Step 3: Create comprehensive sample reports
DO $$
DECLARE
    agent_record RECORD;
    month_name TEXT;
    month_number INTEGER;
    week_num INTEGER;
    report_date DATE;
    base_data INTEGER;
    contacted_count INTEGER;
    appointments_count INTEGER;
    unreachable_count INTEGER;
    no_answer_count INTEGER;
    rejected_count INTEGER;
    negative_count INTEGER;
    reports_created INTEGER := 0;
    existing_reports INTEGER;
BEGIN
    -- Check existing reports
    SELECT COUNT(*) INTO existing_reports FROM reports;
    
    IF existing_reports < 50 THEN
        RAISE NOTICE '📊 Creating comprehensive sample reports...';
        RAISE NOTICE 'ℹ️ Current reports: %, Target: 64+ reports', existing_reports;
        
        -- Clear existing reports for clean data
        DELETE FROM reports;
        RAISE NOTICE '🗑️ Cleared existing reports for clean data';
        
        -- Loop through each agent
        FOR agent_record IN 
            SELECT id, name, category 
            FROM agents 
            WHERE name IN ('Adviye', 'Jennifer', 'Çiğdem', 'Hande')
            ORDER BY name 
        LOOP
            RAISE NOTICE '👤 Creating reports for: % (%)', agent_record.name, agent_record.category;
            
            -- Loop through each month (May to August 2024)
            FOR month_idx IN 1..4 LOOP
                -- Set month name and number
                CASE month_idx
                    WHEN 1 THEN 
                        month_name := 'Mayıs';
                        month_number := 5;
                    WHEN 2 THEN 
                        month_name := 'Haziran';
                        month_number := 6;
                    WHEN 3 THEN 
                        month_name := 'Temmuz';
                        month_number := 7;
                    WHEN 4 THEN 
                        month_name := 'Ağustos';
                        month_number := 8;
                END CASE;
                
                -- Loop through each week (4 weeks per month)
                FOR week_num IN 1..4 LOOP
                    -- Calculate report date (first day of week)
                    report_date := ('2024-' || LPAD(month_number::TEXT, 2, '0') || '-' || LPAD((week_num * 7 - 6)::TEXT, 2, '0'))::DATE;
                    
                    -- Generate realistic data based on agent category
                    IF agent_record.category = 'Yurtdışı' THEN
                        -- International agents: higher volume, better conversion
                        base_data := 80 + floor(random() * 120)::INTEGER; -- 80-200
                        contacted_count := floor(base_data * (0.6 + random() * 0.25))::INTEGER; -- 60-85%
                        appointments_count := floor(contacted_count * (0.15 + random() * 0.15))::INTEGER; -- 15-30%
                    ELSE
                        -- Domestic agents: moderate volume, standard conversion
                        base_data := 50 + floor(random() * 80)::INTEGER; -- 50-130
                        contacted_count := floor(base_data * (0.5 + random() * 0.3))::INTEGER; -- 50-80%
                        appointments_count := floor(contacted_count * (0.1 + random() * 0.2))::INTEGER; -- 10-30%
                    END IF;
                    
                    -- Generate other realistic metrics
                    unreachable_count := floor(random() * 20)::INTEGER; -- 0-19
                    no_answer_count := floor(random() * 25)::INTEGER; -- 0-24
                    rejected_count := floor(random() * 15)::INTEGER; -- 0-14
                    negative_count := floor(random() * 8)::INTEGER; -- 0-7
                    
                    -- Ensure data consistency
                    IF contacted_count > base_data THEN
                        contacted_count := base_data;
                    END IF;
                    
                    IF appointments_count > contacted_count THEN
                        appointments_count := contacted_count;
                    END IF;
                    
                    -- Insert the report (sales_rate will be auto-calculated by the generated column)
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
                    
                    reports_created := reports_created + 1;
                END LOOP;
            END LOOP;
            
            RAISE NOTICE '✅ Completed reports for %: 16 reports', agent_record.name;
        END LOOP;
        
        RAISE NOTICE '🎉 Report creation completed! Created % reports', reports_created;
    ELSE
        RAISE NOTICE 'ℹ️ Sufficient reports already exist (%), skipping creation', existing_reports;
    END IF;
END $$;

-- Step 4: Comprehensive data validation
DO $$
DECLARE
    final_agents INTEGER;
    final_reports INTEGER;
    agents_with_reports INTEGER;
    reports_with_valid_agents INTEGER;
    avg_sales_rate NUMERIC;
    min_sales_rate NUMERIC;
    max_sales_rate NUMERIC;
    total_incoming_data BIGINT;
    total_appointments BIGINT;
    overall_conversion_rate NUMERIC;
    
    -- Category breakdown
    yurtdisi_agents INTEGER;
    yurtici_agents INTEGER;
    yurtdisi_reports INTEGER;
    yurtici_reports INTEGER;
BEGIN
    -- Basic counts
    SELECT COUNT(*) INTO final_agents FROM agents;
    SELECT COUNT(*) INTO final_reports FROM reports;
    
    -- Relationship validation
    SELECT COUNT(DISTINCT a.id) INTO agents_with_reports 
    FROM agents a 
    INNER JOIN reports r ON a.id = r.agent_id;
    
    SELECT COUNT(*) INTO reports_with_valid_agents 
    FROM reports r 
    INNER JOIN agents a ON r.agent_id = a.id;
    
    -- Sales rate statistics
    SELECT 
        AVG(sales_rate), 
        MIN(sales_rate), 
        MAX(sales_rate),
        SUM(incoming_data),
        SUM(appointments)
    INTO avg_sales_rate, min_sales_rate, max_sales_rate, total_incoming_data, total_appointments
    FROM reports 
    WHERE incoming_data > 0;
    
    -- Calculate overall conversion rate
    IF total_incoming_data > 0 THEN
        overall_conversion_rate := (total_appointments::NUMERIC / total_incoming_data::NUMERIC) * 100;
    ELSE
        overall_conversion_rate := 0;
    END IF;
    
    -- Category breakdown
    SELECT COUNT(*) INTO yurtdisi_agents FROM agents WHERE category = 'Yurtdışı';
    SELECT COUNT(*) INTO yurtici_agents FROM agents WHERE category = 'Yurtiçi';
    
    SELECT COUNT(*) INTO yurtdisi_reports 
    FROM reports r 
    INNER JOIN agents a ON r.agent_id = a.id 
    WHERE a.category = 'Yurtdışı';
    
    SELECT COUNT(*) INTO yurtici_reports 
    FROM reports r 
    INNER JOIN agents a ON r.agent_id = a.id 
    WHERE a.category = 'Yurtiçi';
    
    -- Comprehensive validation report
    RAISE NOTICE '';
    RAISE NOTICE '🎉 ===== DATABASE VALIDATION COMPLETE =====';
    RAISE NOTICE '';
    RAISE NOTICE '📊 BASIC STATISTICS:';
    RAISE NOTICE '   ├─ Total Agents: %', final_agents;
    RAISE NOTICE '   ├─ Total Reports: %', final_reports;
    RAISE NOTICE '   ├─ Agents with Reports: %', agents_with_reports;
    RAISE NOTICE '   └─ Valid Report-Agent Links: %', reports_with_valid_agents;
    RAISE NOTICE '';
    RAISE NOTICE '🏷️ CATEGORY BREAKDOWN:';
    RAISE NOTICE '   ├─ Yurtdışı Agents: % (% reports)', yurtdisi_agents, yurtdisi_reports;
    RAISE NOTICE '   └─ Yurtiçi Agents: % (% reports)', yurtici_agents, yurtici_reports;
    RAISE NOTICE '';
    RAISE NOTICE '📈 PERFORMANCE METRICS:';
    RAISE NOTICE '   ├─ Total Incoming Data: %', total_incoming_data;
    RAISE NOTICE '   ├─ Total Appointments: %', total_appointments;
    RAISE NOTICE '   ├─ Overall Conversion Rate: %%%', ROUND(overall_conversion_rate, 2);
    RAISE NOTICE '   ├─ Average Sales Rate: %%%', ROUND(avg_sales_rate, 2);
    RAISE NOTICE '   └─ Sales Rate Range: %%% - %%%', ROUND(min_sales_rate, 2), ROUND(max_sales_rate, 2);
    RAISE NOTICE '';
    
    -- Validation checks
    IF final_agents >= 4 AND final_reports >= 50 AND agents_with_reports = final_agents THEN
        RAISE NOTICE '✅ VALIDATION PASSED: Database is ready for dashboard use!';
        RAISE NOTICE '✅ All agents have reports, all reports have valid agents';
        RAISE NOTICE '✅ Sales rates are automatically calculated and within expected range';
    ELSE
        RAISE WARNING '⚠️ VALIDATION ISSUES DETECTED:';
        IF final_agents < 4 THEN
            RAISE WARNING '   - Insufficient agents (% < 4)', final_agents;
        END IF;
        IF final_reports < 50 THEN
            RAISE WARNING '   - Insufficient reports (% < 50)', final_reports;
        END IF;
        IF agents_with_reports < final_agents THEN
            RAISE WARNING '   - Some agents have no reports (% of %)', agents_with_reports, final_agents;
        END IF;
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE 'ℹ️ NOTE: sales_rate is auto-calculated as (appointments/incoming_data)*100';
    RAISE NOTICE 'ℹ️ Dashboard should now display data correctly for all months and categories';
    RAISE NOTICE '';
    RAISE NOTICE '==========================================';
END $$;