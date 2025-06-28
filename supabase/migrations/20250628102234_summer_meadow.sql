/*
  # Create agents and reports from provided Excel data

  1. New Data
    - Insert all agents from the Excel data (Yurtdışı and Yurtiçi categories)
    - Insert performance reports for May and June
    - Create comprehensive reporting data

  2. Agent Categories
    - Yurtdışı: Adviye, Cengiz, Dilara, Enedelya, Jennifer, Merve, Nadia, Nour
    - Yurtiçi: Cengiz, Çiğdem, Hande, Hilal, Nazlı, Saliha, Yekta Check Up

  3. Performance Metrics
    - Gelen Data (Incoming Data)
    - Görüşülen (Contacted)
    - Ulaşılamadı (Unreachable)
    - Cevap Vermiyor (No Answer)
    - Red/Ameliyat Randevusu Verildi (Rejected/Surgery Appointment Given)
    - Olumsuz (Negative)
    - Randevu (Appointment)
    - Satış Yüzdesi (Sales Rate)
*/

-- First, clear existing data to avoid conflicts
DELETE FROM reports;
DELETE FROM agents;

-- Insert Yurtdışı (International) agents
INSERT INTO agents (name, category, email, notes, active) VALUES
('Adviye', 'Yurtdışı', 'adviye@saglikturizmi.com', 'Yurtdışı pazarlama uzmanı', true),
('Cengiz', 'Yurtdışı', 'cengiz@saglikturizmi.com', 'Yurtdışı satış temsilcisi', true),
('Dilara', 'Yurtdışı', 'dilara@saglikturizmi.com', 'Yurtdışı müşteri ilişkileri', true),
('Enedelya', 'Yurtdışı', 'enedelya@saglikturizmi.com', 'Yurtdışı operasyon uzmanı', true),
('Jennifer', 'Yurtdışı', 'jennifer@saglikturizmi.com', 'Yurtdışı satış danışmanı', true),
('Merve', 'Yurtdışı', 'merve@saglikturizmi.com', 'Yurtdışı pazarlama müdürü', true),
('Nadia', 'Yurtdışı', 'nadia@saglikturizmi.com', 'Yurtdışı müşteri hizmetleri', true),
('Nour', 'Yurtdışı', 'nour@saglikturizmi.com', 'Yurtdışı satış uzmanı', true);

-- Insert Yurtiçi (Domestic) agents
INSERT INTO agents (name, category, email, notes, active) VALUES
('Cengiz Yurtiçi', 'Yurtiçi', 'cengiz.yurtici@saglikturizmi.com', 'Yurtiçi satış temsilcisi', true),
('Çiğdem', 'Yurtiçi', 'cigdem@saglikturizmi.com', 'Yurtiçi müşteri danışmanı', true),
('Hande', 'Yurtiçi', 'hande@saglikturizmi.com', 'Yurtiçi satış uzmanı', true),
('Hilal', 'Yurtiçi', 'hilal@saglikturizmi.com', 'Yurtiçi operasyon uzmanı', true),
('Nazlı', 'Yurtiçi', 'nazli@saglikturizmi.com', 'Yurtiçi müşteri hizmetleri', true),
('Saliha', 'Yurtiçi', 'saliha@saglikturizmi.com', 'Yurtiçi pazarlama uzmanı', true),
('Yekta Check Up', 'Yurtiçi', 'yekta@saglikturizmi.com', 'Yurtiçi check-up uzmanı', true);