/*
  # Insert May (Mayıs) performance reports

  Data from Excel for May month performance
*/

-- Insert May reports for Yurtdışı agents
INSERT INTO reports (agent_id, date, month, week, incoming_data, contacted, unreachable, no_answer, rejected, negative, appointments)
SELECT 
  a.id,
  '2024-05-15'::date,
  'Mayıs',
  3,
  CASE a.name
    WHEN 'Adviye' THEN 436
    WHEN 'Cengiz' THEN 70
    WHEN 'Dilara' THEN 93
    WHEN 'Enedelya' THEN 119
    WHEN 'Jennifer' THEN 186
    WHEN 'Merve' THEN 614
    WHEN 'Nadia' THEN 1005
    WHEN 'Nour' THEN 159
  END,
  CASE a.name
    WHEN 'Adviye' THEN 263
    WHEN 'Cengiz' THEN 37
    WHEN 'Dilara' THEN 33
    WHEN 'Enedelya' THEN 49
    WHEN 'Jennifer' THEN 71
    WHEN 'Merve' THEN 297
    WHEN 'Nadia' THEN 519
    WHEN 'Nour' THEN 259
  END,
  CASE a.name
    WHEN 'Adviye' THEN 35
    WHEN 'Cengiz' THEN 1
    WHEN 'Dilara' THEN 33
    WHEN 'Enedelya' THEN 32
    WHEN 'Jennifer' THEN 72
    WHEN 'Merve' THEN 38
    WHEN 'Nadia' THEN 20
    WHEN 'Nour' THEN 115
  END,
  CASE a.name
    WHEN 'Adviye' THEN 138
    WHEN 'Cengiz' THEN 20
    WHEN 'Dilara' THEN 22
    WHEN 'Enedelya' THEN 19
    WHEN 'Jennifer' THEN 42
    WHEN 'Merve' THEN 226
    WHEN 'Nadia' THEN 307
    WHEN 'Nour' THEN 0
  END,
  CASE a.name
    WHEN 'Adviye' THEN 0
    WHEN 'Cengiz' THEN 0
    WHEN 'Dilara' THEN 3
    WHEN 'Enedelya' THEN 0
    WHEN 'Jennifer' THEN 1
    WHEN 'Merve' THEN 19
    WHEN 'Nadia' THEN 60
    WHEN 'Nour' THEN 0
  END,
  CASE a.name
    WHEN 'Adviye' THEN 0
    WHEN 'Cengiz' THEN 12
    WHEN 'Dilara' THEN 2
    WHEN 'Enedelya' THEN 19
    WHEN 'Jennifer' THEN 0
    WHEN 'Merve' THEN 34
    WHEN 'Nadia' THEN 99
    WHEN 'Nour' THEN 44
  END,
  CASE a.name
    WHEN 'Adviye' THEN 4
    WHEN 'Cengiz' THEN 5
    WHEN 'Dilara' THEN 5
    WHEN 'Enedelya' THEN 5
    WHEN 'Jennifer' THEN 12
    WHEN 'Merve' THEN 2
    WHEN 'Nadia' THEN 9
    WHEN 'Nour' THEN 6
  END
FROM agents a
WHERE a.category = 'Yurtdışı' AND a.name IN ('Adviye', 'Cengiz', 'Dilara', 'Enedelya', 'Jennifer', 'Merve', 'Nadia', 'Nour');

-- Insert May reports for Yurtiçi agents
INSERT INTO reports (agent_id, date, month, week, incoming_data, contacted, unreachable, no_answer, rejected, negative, appointments)
SELECT 
  a.id,
  '2024-05-15'::date,
  'Mayıs',
  3,
  CASE a.name
    WHEN 'Cengiz Yurtiçi' THEN 408
    WHEN 'Çiğdem' THEN 373
    WHEN 'Hande' THEN 291
    WHEN 'Hilal' THEN 240
    WHEN 'Nazlı' THEN 198
    WHEN 'Saliha' THEN 378
    WHEN 'Yekta Check Up' THEN 158
  END,
  CASE a.name
    WHEN 'Cengiz Yurtiçi' THEN 305
    WHEN 'Çiğdem' THEN 281
    WHEN 'Hande' THEN 206
    WHEN 'Hilal' THEN 115
    WHEN 'Nazlı' THEN 115
    WHEN 'Saliha' THEN 248
    WHEN 'Yekta Check Up' THEN 132
  END,
  CASE a.name
    WHEN 'Cengiz Yurtiçi' THEN 61
    WHEN 'Çiğdem' THEN 79
    WHEN 'Hande' THEN 85
    WHEN 'Hilal' THEN 77
    WHEN 'Nazlı' THEN 76
    WHEN 'Saliha' THEN 125
    WHEN 'Yekta Check Up' THEN 21
  END,
  CASE a.name
    WHEN 'Cengiz Yurtiçi' THEN 4
    WHEN 'Çiğdem' THEN 15
    WHEN 'Hande' THEN 25
    WHEN 'Hilal' THEN 20
    WHEN 'Nazlı' THEN 5
    WHEN 'Saliha' THEN 27
    WHEN 'Yekta Check Up' THEN 2
  END,
  CASE a.name
    WHEN 'Cengiz Yurtiçi' THEN 40
    WHEN 'Çiğdem' THEN 12
    WHEN 'Hande' THEN 0
    WHEN 'Hilal' THEN 39
    WHEN 'Nazlı' THEN 5
    WHEN 'Saliha' THEN 5
    WHEN 'Yekta Check Up' THEN 0
  END,
  CASE a.name
    WHEN 'Cengiz Yurtiçi' THEN 0
    WHEN 'Çiğdem' THEN 1
    WHEN 'Hande' THEN 0
    WHEN 'Hilal' THEN 9
    WHEN 'Nazlı' THEN 2
    WHEN 'Saliha' THEN 0
    WHEN 'Yekta Check Up' THEN 5
  END,
  CASE a.name
    WHEN 'Cengiz Yurtiçi' THEN 0
    WHEN 'Çiğdem' THEN 15
    WHEN 'Hande' THEN 20
    WHEN 'Hilal' THEN 26
    WHEN 'Nazlı' THEN 5
    WHEN 'Saliha' THEN 28
    WHEN 'Yekta Check Up' THEN 71
  END
FROM agents a
WHERE a.category = 'Yurtiçi' AND a.name IN ('Cengiz Yurtiçi', 'Çiğdem', 'Hande', 'Hilal', 'Nazlı', 'Saliha', 'Yekta Check Up');