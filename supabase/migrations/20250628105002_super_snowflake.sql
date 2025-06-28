/*
  # Add Sample Agents and Reports Data

  1. New Tables
    - Insert sample agents for both Yurtdışı and Yurtiçi categories
    - Insert sample reports based on the provided Excel data

  2. Data Structure
    - Agents with proper categories and contact information
    - Reports with realistic performance data for May and June
    - Proper relationships between agents and reports

  3. Security
    - Data is inserted with proper foreign key relationships
    - All data follows the existing schema constraints
*/

-- Insert sample agents for Yurtdışı category
INSERT INTO agents (name, category, email, notes, active) VALUES
('Adviye', 'Yurtdışı', 'adviye@saglikturizmi.com', 'Yurtdışı operasyonları uzmanı', true),
('Cengiz', 'Yurtdışı', 'cengiz@saglikturizmi.com', 'Avrupa bölgesi sorumlusu', true),
('Dilara', 'Yurtdışı', 'dilara@saglikturizmi.com', 'Amerika bölgesi sorumlusu', true),
('Enedelya', 'Yurtdışı', 'enedelya@saglikturizmi.com', 'Asya bölgesi sorumlusu', true),
('Jennifer', 'Yurtdışı', 'jennifer@saglikturizmi.com', 'İngilizce konuşan müşteriler', true),
('Merve', 'Yurtdışı', 'merve@saglikturizmi.com', 'Orta Doğu bölgesi sorumlusu', true),
('Nadia', 'Yurtdışı', 'nadia@saglikturizmi.com', 'Afrika bölgesi sorumlusu', true),
('Nour', 'Yurtdışı', 'nour@saglikturizmi.com', 'Arapça konuşan müşteriler', true)
ON CONFLICT (name) DO NOTHING;

-- Insert sample agents for Yurtiçi category
INSERT INTO agents (name, category, email, notes, active) VALUES
('Cengiz', 'Yurtiçi', 'cengiz.yurtici@saglikturizmi.com', 'Yurtiçi operasyonları', true),
('Çiğdem', 'Yurtiçi', 'cigdem@saglikturizmi.com', 'İstanbul bölgesi sorumlusu', true),
('Hande', 'Yurtiçi', 'hande@saglikturizmi.com', 'Ankara bölgesi sorumlusu', true),
('Hilal', 'Yurtiçi', 'hilal@saglikturizmi.com', 'İzmir bölgesi sorumlusu', true),
('Nazlı', 'Yurtiçi', 'nazli@saglikturizmi.com', 'Antalya bölgesi sorumlusu', true),
('Saliha', 'Yurtiçi', 'saliha@saglikturizmi.com', 'Bursa bölgesi sorumlusu', true),
('Yekta Check Up', 'Yurtiçi', 'yekta@saglikturizmi.com', 'Check-up hizmetleri', true)
ON CONFLICT (name) DO NOTHING;

-- Get agent IDs for reports
DO $$
DECLARE
    adviye_id uuid;
    cengiz_yurtdisi_id uuid;
    cengiz_yurtici_id uuid;
    dilara_id uuid;
    enedelya_id uuid;
    jennifer_id uuid;
    merve_id uuid;
    nadia_id uuid;
    nour_id uuid;
    cigdem_id uuid;
    hande_id uuid;
    hilal_id uuid;
    nazli_id uuid;
    saliha_id uuid;
    yekta_id uuid;
BEGIN
    -- Get agent IDs
    SELECT id INTO adviye_id FROM agents WHERE name = 'Adviye' AND category = 'Yurtdışı';
    SELECT id INTO cengiz_yurtdisi_id FROM agents WHERE name = 'Cengiz' AND category = 'Yurtdışı';
    SELECT id INTO cengiz_yurtici_id FROM agents WHERE name = 'Cengiz' AND category = 'Yurtiçi';
    SELECT id INTO dilara_id FROM agents WHERE name = 'Dilara' AND category = 'Yurtdışı';
    SELECT id INTO enedelya_id FROM agents WHERE name = 'Enedelya' AND category = 'Yurtdışı';
    SELECT id INTO jennifer_id FROM agents WHERE name = 'Jennifer' AND category = 'Yurtdışı';
    SELECT id INTO merve_id FROM agents WHERE name = 'Merve' AND category = 'Yurtdışı';
    SELECT id INTO nadia_id FROM agents WHERE name = 'Nadia' AND category = 'Yurtdışı';
    SELECT id INTO nour_id FROM agents WHERE name = 'Nour' AND category = 'Yurtdışı';
    SELECT id INTO cigdem_id FROM agents WHERE name = 'Çiğdem' AND category = 'Yurtiçi';
    SELECT id INTO hande_id FROM agents WHERE name = 'Hande' AND category = 'Yurtiçi';
    SELECT id INTO hilal_id FROM agents WHERE name = 'Hilal' AND category = 'Yurtiçi';
    SELECT id INTO nazli_id FROM agents WHERE name = 'Nazlı' AND category = 'Yurtiçi';
    SELECT id INTO saliha_id FROM agents WHERE name = 'Saliha' AND category = 'Yurtiçi';
    SELECT id INTO yekta_id FROM agents WHERE name = 'Yekta Check Up' AND category = 'Yurtiçi';

    -- Insert Mayıs reports for Yurtdışı agents
    INSERT INTO reports (agent_id, date, month, week, incoming_data, contacted, unreachable, no_answer, rejected, negative, appointments) VALUES
    (adviye_id, '2024-05-01', 'Mayıs', 1, 436, 263, 35, 138, 0, 0, 4),
    (cengiz_yurtdisi_id, '2024-05-01', 'Mayıs', 1, 70, 37, 1, 20, 0, 12, 5),
    (dilara_id, '2024-05-01', 'Mayıs', 1, 93, 33, 33, 22, 3, 2, 5),
    (enedelya_id, '2024-05-01', 'Mayıs', 1, 119, 49, 32, 19, 0, 19, 5),
    (jennifer_id, '2024-05-01', 'Mayıs', 1, 186, 71, 72, 42, 1, 0, 12),
    (merve_id, '2024-05-01', 'Mayıs', 1, 614, 297, 38, 226, 19, 34, 2),
    (nadia_id, '2024-05-01', 'Mayıs', 1, 1005, 519, 20, 307, 60, 99, 9),
    (nour_id, '2024-05-01', 'Mayıs', 1, 159, 259, 115, 0, 0, 44, 6);

    -- Insert Haziran reports for Yurtdışı agents
    INSERT INTO reports (agent_id, date, month, week, incoming_data, contacted, unreachable, no_answer, rejected, negative, appointments) VALUES
    (adviye_id, '2024-06-01', 'Haziran', 1, 186, 93, 0, 0, 0, 0, 4),
    (cengiz_yurtdisi_id, '2024-06-01', 'Haziran', 1, 58, 43, 2, 13, 0, 4, 1),
    (dilara_id, '2024-06-01', 'Haziran', 1, 64, 31, 22, 11, 2, 1, 0),
    (enedelya_id, '2024-06-01', 'Haziran', 1, 102, 84, 16, 2, 0, 9, 8),
    (jennifer_id, '2024-06-01', 'Haziran', 1, 152, 76, 47, 29, 0, 0, 11),
    (merve_id, '2024-06-01', 'Haziran', 1, 515, 253, 96, 166, 24, 48, 5),
    (nadia_id, '2024-06-01', 'Haziran', 1, 682, 385, 20, 277, 45, 68, 5),
    (nour_id, '2024-06-01', 'Haziran', 1, 110, 36, 71, 3, 0, 35, 1);

    -- Insert Mayıs reports for Yurtiçi agents
    INSERT INTO reports (agent_id, date, month, week, incoming_data, contacted, unreachable, no_answer, rejected, negative, appointments) VALUES
    (cengiz_yurtici_id, '2024-05-01', 'Mayıs', 1, 408, 305, 61, 4, 40, 0, 6),
    (cigdem_id, '2024-05-01', 'Mayıs', 1, 373, 281, 79, 15, 12, 1, 15),
    (hande_id, '2024-05-01', 'Mayıs', 1, 291, 206, 85, 25, 0, 0, 20),
    (hilal_id, '2024-05-01', 'Mayıs', 1, 240, 115, 77, 20, 39, 9, 25),
    (nazli_id, '2024-05-01', 'Mayıs', 1, 198, 115, 76, 5, 5, 2, 0),
    (saliha_id, '2024-05-01', 'Mayıs', 1, 378, 248, 125, 27, 5, 0, 28),
    (yekta_id, '2024-05-01', 'Mayıs', 1, 158, 132, 1, 2, 0, 5, 71);

    -- Insert Haziran reports for Yurtiçi agents
    INSERT INTO reports (agent_id, date, month, week, incoming_data, contacted, unreachable, no_answer, rejected, negative, appointments) VALUES
    (cengiz_yurtici_id, '2024-06-01', 'Haziran', 1, 253, 173, 73, 12, 7, 0, 3),
    (cigdem_id, '2024-06-01', 'Haziran', 1, 66, 37, 21, 1, 8, 0, 6),
    (hande_id, '2024-06-01', 'Haziran', 1, 182, 105, 37, 10, 40, 0, 16),
    (hilal_id, '2024-06-01', 'Haziran', 1, 150, 102, 28, 3, 20, 0, 10),
    (nazli_id, '2024-06-01', 'Haziran', 1, 282, 223, 59, 3, 0, 0, 1),
    (saliha_id, '2024-06-01', 'Haziran', 1, 364, 236, 126, 7, 0, 2, 11),
    (yekta_id, '2024-06-01', 'Haziran', 1, 0, 0, 0, 0, 0, 0, 0);

END $$;