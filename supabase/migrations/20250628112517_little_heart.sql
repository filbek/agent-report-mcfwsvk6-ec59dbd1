/*
  # Create Sample Data for Health Tourism Admin Panel

  1. New Tables
    - Sample agents for both Yurtdışı and Yurtiçi categories
    - Sample reports with realistic data for May and June

  2. Security
    - Uses existing RLS policies
    - Data is safe for demo purposes

  3. Data Structure
    - 8 Yurtdışı agents with varied performance data
    - 7 Yurtiçi agents with varied performance data
    - Monthly reports for May and June 2024
*/

-- Clear existing data to avoid conflicts
DELETE FROM reports;
DELETE FROM agents WHERE name NOT LIKE '%admin%';

-- Insert Yurtdışı agents
INSERT INTO agents (name, category, email, notes, active) VALUES
('Adviye', 'Yurtdışı', 'adviye@saglikturizmi.com', 'Yurtdışı operasyonları uzmanı', true),
('Cengiz Yurtdışı', 'Yurtdışı', 'cengiz.yurtdisi@saglikturizmi.com', 'Avrupa bölgesi sorumlusu', true),
('Dilara', 'Yurtdışı', 'dilara@saglikturizmi.com', 'Amerika bölgesi sorumlusu', true),
('Enedelya', 'Yurtdışı', 'enedelya@saglikturizmi.com', 'Asya bölgesi sorumlusu', true),
('Jennifer', 'Yurtdışı', 'jennifer@saglikturizmi.com', 'İngilizce konuşan müşteriler', true),
('Merve', 'Yurtdışı', 'merve@saglikturizmi.com', 'Orta Doğu bölgesi sorumlusu', true),
('Nadia', 'Yurtdışı', 'nadia@saglikturizmi.com', 'Afrika bölgesi sorumlusu', true),
('Nour', 'Yurtdışı', 'nour@saglikturizmi.com', 'Arapça konuşan müşteriler', true)
ON CONFLICT (name) DO NOTHING;

-- Insert Yurtiçi agents
INSERT INTO agents (name, category, email, notes, active) VALUES
('Cengiz Yurtiçi', 'Yurtiçi', 'cengiz.yurtici@saglikturizmi.com', 'Yurtiçi operasyonları', true),
('Çiğdem', 'Yurtiçi', 'cigdem@saglikturizmi.com', 'İstanbul bölgesi sorumlusu', true),
('Hande', 'Yurtiçi', 'hande@saglikturizmi.com', 'Ankara bölgesi sorumlusu', true),
('Hilal', 'Yurtiçi', 'hilal@saglikturizmi.com', 'İzmir bölgesi sorumlusu', true),
('Nazlı', 'Yurtiçi', 'nazli@saglikturizmi.com', 'Antalya bölgesi sorumlusu', true),
('Saliha', 'Yurtiçi', 'saliha@saglikturizmi.com', 'Bursa bölgesi sorumlusu', true),
('Yekta Check Up', 'Yurtiçi', 'yekta@saglikturizmi.com', 'Check-up hizmetleri', true)
ON CONFLICT (name) DO NOTHING;

-- Insert Mayıs reports for Yurtdışı agents
INSERT INTO reports (agent_id, date, month, week, incoming_data, contacted, unreachable, no_answer, rejected, negative, appointments)
SELECT 
    a.id,
    '2024-05-01'::date,
    'Mayıs',
    1,
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
ON a.name = data.name AND a.category = 'Yurtdışı';

-- Insert Haziran reports for Yurtdışı agents
INSERT INTO reports (agent_id, date, month, week, incoming_data, contacted, unreachable, no_answer, rejected, negative, appointments)
SELECT 
    a.id,
    '2024-06-01'::date,
    'Haziran',
    1,
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
ON a.name = data.name AND a.category = 'Yurtdışı';

-- Insert Mayıs reports for Yurtiçi agents
INSERT INTO reports (agent_id, date, month, week, incoming_data, contacted, unreachable, no_answer, rejected, negative, appointments)
SELECT 
    a.id,
    '2024-05-01'::date,
    'Mayıs',
    1,
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
ON a.name = data.name AND a.category = 'Yurtiçi';

-- Insert Haziran reports for Yurtiçi agents
INSERT INTO reports (agent_id, date, month, week, incoming_data, contacted, unreachable, no_answer, rejected, negative, appointments)
SELECT 
    a.id,
    '2024-06-01'::date,
    'Haziran',
    1,
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
ON a.name = data.name AND a.category = 'Yurtiçi';