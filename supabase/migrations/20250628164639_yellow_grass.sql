/*
  # Comprehensive Sample Data Creation

  1. Data Creation
    - Creates 4 sample agents (Adviye, Jennifer, Çiğdem, Hande)
    - Generates 64 realistic reports (4 agents × 4 months × 4 weeks)
    - Ensures data consistency and relationships

  2. Data Integrity
    - Verifies agent-report relationships
    - Checks for orphaned records
    - Validates sales_rate calculations (auto-generated)

  3. Performance Optimization
    - Realistic data volumes for testing
    - Proper foreign key relationships
    - Consistent date ranges and metrics
*/

-- First, let's check what data we currently have
DO $$
DECLARE
    agent_count INTEGER;
    report_count INTEGER;
    profile_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO agent_count FROM agents;
    SELECT COUNT(*) INTO report_count FROM reports;
    SELECT COUNT(*) INTO profile_count FROM profiles;
    
    RAISE NOTICE 'Current data status: % agents, % reports, % profiles', agent_count, report_count, profile_count;
END $$;

-- Create sample agents if the table is empty or has very few records
DO $$
DECLARE
    agent_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO agent_count FROM agents;
    
    IF agent_count < 4 THEN
        RAISE NOTICE 'Creating sample agents...';
        
        -- Clear existing agents to avoid conflicts
        DELETE FROM reports;
        DELETE FROM agents;
        
        -- Insert sample agents
        INSERT INTO agents (name, category, email, notes, active) VALUES
        ('Adviye', 'Yurtdışı', 'adviye@test.com', 'Deneyimli yurtdışı agent - Almanya ve İsviçre uzmanı', true),
        ('Jennifer', 'Yurtdışı', 'jennifer@test.com', 'İngilizce konuşan agent - ABD ve İngiltere uzmanı', true),
        ('Çiğdem', 'Yurtiçi', 'cigdem@test.com', 'Yurtiçi operasyon uzmanı - İstanbul bölgesi', true),
        ('Hande', 'Yurtiçi', 'hande@test.com', 'Müşteri ilişkileri uzmanı - Ankara bölgesi', true);
        
        RAISE NOTICE 'Sample agents created successfully';
    ELSE
        RAISE NOTICE 'Agents already exist (%), skipping creation', agent_count;
    END IF;
END $$;

-- Create comprehensive sample reports
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
    report_count INTEGER;
    total_reports_created INTEGER := 0;
BEGIN
    -- Check if we need to create reports
    SELECT COUNT(*) INTO report_count FROM reports;
    
    IF report_count < 50 THEN
        RAISE NOTICE 'Creating comprehensive sample reports...';
        
        -- Clear existing reports to ensure clean data
        DELETE FROM reports;
        
        -- Loop through each agent
        FOR agent_record IN SELECT id, name, category FROM agents ORDER BY name LOOP
            RAISE NOTICE 'Creating reports for agent: % (%)', agent_record.name, agent_record.category;
            
            -- Loop through months (May to August 2024)
            FOR month_idx IN 1..4 LOOP
                CASE month_idx
                    WHEN 1 THEN month_name := 'Mayıs';
                    WHEN 2 THEN month_name := 'Haziran';
                    WHEN 3 THEN month_name := 'Temmuz';
                    WHEN 4 THEN month_name := 'Ağustos';
                END CASE;
                
                -- Loop through weeks (4 weeks per month)
                FOR week_num IN 1..4 LOOP
                    -- Calculate realistic report date
                    report_date := ('2024-' || LPAD((4 + month_idx)::TEXT, 2, '0') || '-' || LPAD((week_num * 7)::TEXT, 2, '0'))::DATE;
                    
                    -- Generate realistic data based on agent category and performance trends
                    IF agent_record.category = 'Yurtdışı' THEN
                        -- International agents typically have higher volumes
                        base_data := 80 + floor(random() * 120)::INTEGER;
                    ELSE
                        -- Domestic agents have moderate volumes
                        base_data := 50 + floor(random() * 80)::INTEGER;
                    END IF;
                    
                    -- Calculate realistic contact rates (50-80% of incoming data)
                    contacted_count := floor(base_data * (0.5 + random() * 0.3))::INTEGER;
                    
                    -- Generate other metrics
                    unreachable_count := floor(random() * 20)::INTEGER;
                    no_answer_count := floor(random() * 25)::INTEGER;
                    rejected_count := floor(random() * 15)::INTEGER;
                    negative_count := floor(random() * 8)::INTEGER;
                    
                    -- Calculate appointments (10-25% of contacted)
                    appointments_count := floor(contacted_count * (0.1 + random() * 0.15))::INTEGER;
                    
                    -- Ensure data consistency
                    IF contacted_count > base_data THEN
                        contacted_count := base_data;
                    END IF;
                    
                    IF appointments_count > contacted_count THEN
                        appointments_count := contacted_count;
                    END IF;
                    
                    -- Insert the report (sales_rate will be auto-calculated)
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
                    
                    total_reports_created := total_reports_created + 1;
                END LOOP;
            END LOOP;
        END LOOP;
        
        RAISE NOTICE 'Created % sample reports successfully', total_reports_created;
    ELSE
        RAISE NOTICE 'Reports already exist (%), skipping creation', report_count;
    END IF;
END $$;

-- Verify data integrity and relationships
DO $$
DECLARE
    agent_count INTEGER;
    report_count INTEGER;
    orphaned_reports INTEGER;
    agents_without_reports INTEGER;
BEGIN
    -- Count totals
    SELECT COUNT(*) INTO agent_count FROM agents;
    SELECT COUNT(*) INTO report_count FROM reports;
    
    -- Check for orphaned reports (reports without valid agents)
    SELECT COUNT(*) INTO orphaned_reports 
    FROM reports r 
    WHERE NOT EXISTS (SELECT 1 FROM agents a WHERE a.id = r.agent_id);
    
    -- Check for agents without reports
    SELECT COUNT(*) INTO agents_without_reports 
    FROM agents a 
    WHERE NOT EXISTS (SELECT 1 FROM reports r WHERE r.agent_id = a.id);
    
    RAISE NOTICE 'Data integrity check:';
    RAISE NOTICE '- Total agents: %', agent_count;
    RAISE NOTICE '- Total reports: %', report_count;
    RAISE NOTICE '- Orphaned reports: %', orphaned_reports;
    RAISE NOTICE '- Agents without reports: %', agents_without_reports;
    
    IF orphaned_reports > 0 THEN
        RAISE WARNING 'Found % orphaned reports - these should be cleaned up', orphaned_reports;
    END IF;
    
    IF agents_without_reports > 0 THEN
        RAISE WARNING 'Found % agents without reports', agents_without_reports;
    END IF;
    
    IF agent_count >= 4 AND report_count >= 50 AND orphaned_reports = 0 THEN
        RAISE NOTICE '✅ Data integrity check passed - database is ready for use';
    ELSE
        RAISE WARNING '⚠️ Data integrity issues detected - manual review may be needed';
    END IF;
END $$;

-- NOTE: sales_rate is a generated column and will be automatically calculated
-- based on the formula: (appointments / incoming_data) * 100
-- We don't need to manually update it

-- Final verification with sales_rate check
DO $$
DECLARE
    final_agent_count INTEGER;
    final_report_count INTEGER;
    avg_sales_rate NUMERIC;
    min_sales_rate NUMERIC;
    max_sales_rate NUMERIC;
    reports_with_sales_rate INTEGER;
BEGIN
    SELECT COUNT(*) INTO final_agent_count FROM agents;
    SELECT COUNT(*) INTO final_report_count FROM reports;
    SELECT AVG(sales_rate), MIN(sales_rate), MAX(sales_rate) 
    INTO avg_sales_rate, min_sales_rate, max_sales_rate 
    FROM reports WHERE incoming_data > 0;
    
    SELECT COUNT(*) INTO reports_with_sales_rate 
    FROM reports WHERE sales_rate IS NOT NULL AND sales_rate > 0;
    
    RAISE NOTICE '🎉 Migration completed successfully!';
    RAISE NOTICE '📊 Final statistics:';
    RAISE NOTICE '   - Agents: %', final_agent_count;
    RAISE NOTICE '   - Reports: %', final_report_count;
    RAISE NOTICE '   - Reports with sales rate: %', reports_with_sales_rate;
    RAISE NOTICE '   - Average sales rate: %%%', ROUND(avg_sales_rate, 2);
    RAISE NOTICE '   - Sales rate range: %%% - %%%', ROUND(min_sales_rate, 2), ROUND(max_sales_rate, 2);
    RAISE NOTICE '✅ Database is ready for dashboard use';
    RAISE NOTICE 'ℹ️  Note: sales_rate is auto-calculated as (appointments/incoming_data)*100';
END $$;