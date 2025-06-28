/*
  # Insert June (Haziran) performance reports

  Data from Excel for June month performance
*/

-- Insert June reports for Yurtdışı agents
INSERT INTO reports (agent_id, date, month, week, incoming_data, contacted, unreachable, no_answer, rejected, negative, appointments)
SELECT 
  a.id,
  '2024-06-15'::date,
  'Haziran',
  3,
  CASE a.name
    WHEN 'Adviye' THEN 186
    WHEN 'Cengiz' THEN 58
    WHEN 'Dilara' THEN 64
    WHEN 'Enedelya' THEN 102
    WHEN 'Jennifer' THEN 152
    WHEN 'Merve' THEN 515
    WHEN 'Nadia' THEN 682
    WHEN 'Nour' THEN 110
  END,
  CASE a.name
    WHEN 'Adviye' THEN 93
    WHEN 'Cengiz' THEN 43
    WHEN 'Dilara' THEN 31
    WHEN 'Enedelya' THEN 84
    WHEN 'Jennifer' THEN 76
    WHEN 'Merve' THEN 253
    WHEN 'Nadia' THEN 385
    WHEN 'Nour' THEN 36
  END,
  CASE a.name
    WHEN 'Adviye' THEN 0
    WHEN 'Cengiz' THEN 2
    WHEN 'Dilara' THEN 22
    WHEN 'Enedelya' THEN 16
    WHEN 'Jennifer' THEN 47
    WHEN 'Merve' THEN 96
    WHEN 'Nadia' THEN 20
    WHEN 'Nour' THEN 71
  END,
  CASE a.name
    WHEN 'Adviye' THEN 0
    WHEN 'Cengiz' THEN 13
    WHEN 'Dilara' THEN 11
    WHEN 'Enedelya' THEN 2
    WHEN 'Jennifer' THEN 29
    WHEN 'Merve' THEN 166
    WHEN 'Nadia' THEN 277
    WHEN 'Nour' THEN 3
  END,
  CASE a.name
    WHEN 'Adviye' THEN 0
    WHEN 'Cengiz' THEN 0
    WHEN 'Dilara' THEN 2
    WHEN 'Enedelya' THEN 0
    WHEN 'Jennifer' THEN 0
    WHEN 'Merve' THEN 24
    WHEN 'Nadia' THEN 45
    WHEN 'Nour' THEN 0
  END,
  CASE a.name
    WHEN 'Adviye' THEN 0
    WHEN 'Cengiz' THEN 4
    WHEN 'Dilara' THEN 1
    WHEN 'Enedelya' THEN 9
    WHEN 'Jennifer' THEN 0
    WHEN 'Merve' THEN 48
    WHEN 'Nadia' THEN 68
    WHEN 'Nour' THEN 35
  END,
  CASE a.name
    WHEN 'Adviye' THEN 4
    WHEN 'Cengiz' THEN 1
    WHEN 'Dilara' THEN 0
    WHEN 'Enedelya' THEN 8
    WHEN 'Jennifer' THEN 11
    WHEN 'Merve' THEN 5
    WHEN 'Nadia' THEN 5
    WHEN 'Nour' THEN 1
  END
FROM agents a
WHERE a.category = 'Yurtdışı' AND a.name IN ('Adviye', 'Cengiz', 'Dilara', 'Enedelya', 'Jennifer', 'Merve', 'Nadia', 'Nour');

-- Insert June reports for Yurtiçi agents
INSERT INTO reports (agent_id, date, month, week, incoming_data, contacted, unreachable, no_answer, rejected, negative, appointments)
SELECT 
  a.id,
  '2024-06-15'::date,
  'Haziran',
  3,
  CASE a.name
    WHEN 'Cengiz Yurtiçi' THEN 253
    WHEN 'Çiğdem' THEN 66
    WHEN 'Hande' THEN 182
    WHEN 'Hilal' THEN 150
    WHEN 'Nazlı' THEN 282
    WHEN 'Saliha' THEN 364
  END,
  CASE a.name
    WHEN 'Cengiz Yurtiçi' THEN 173
    WHEN 'Çiğdem' THEN 37
    WHEN 'Hande' THEN 105
    WHEN 'Hilal' THEN 102
    WHEN 'Nazlı' THEN 223
    WHEN 'Saliha' THEN 236
  END,
  CASE a.name
    WHEN 'Cengiz Yurtiçi' THEN 73
    WHEN 'Çiğdem' THEN 21
    WHEN 'Hande' THEN 37
    WHEN 'Hilal' THEN 28
    WHEN 'Nazlı' THEN 59
    WHEN 'Saliha' THEN 126
  END,
  CASE a.name
    WHEN 'Cengiz Yurtiçi' THEN 12
    WHEN 'Çiğdem' THEN 1
    WHEN 'Hande' THEN 10
    WHEN 'Hilal' THEN 3
    WHEN 'Nazlı' THEN 3
    WHEN 'Saliha' THEN 7
  END,
  CASE a.name
    WHEN 'Cengiz Yurtiçi' THEN 7
    WHEN 'Çiğdem' THEN 8
    WHEN 'Hande' THEN 40
    WHEN 'Hilal' THEN 20
    WHEN 'Nazlı' THEN 0
    WHEN 'Saliha' THEN 0
  END,
  CASE a.name
    WHEN 'Cengiz Yurtiçi' THEN 0
    WHEN 'Çiğdem' THEN 0
    WHEN 'Hande' THEN 0
    WHEN 'Hilal' THEN 0
    WHEN 'Nazlı' THEN 0
    WHEN 'Saliha' THEN 2
  END,
  CASE a.name
    WHEN 'Cengiz Yurtiçi' THEN 3
    WHEN 'Çiğdem' THEN 6
    WHEN 'Hande' THEN 16
    WHEN 'Hilal' THEN 10
    WHEN 'Nazlı' THEN 1
    WHEN 'Saliha' THEN 11
  END
FROM agents a
WHERE a.category = 'Yurtiçi' AND a.name IN ('Cengiz Yurtiçi', 'Çiğdem', 'Hande', 'Hilal', 'Nazlı', 'Saliha');