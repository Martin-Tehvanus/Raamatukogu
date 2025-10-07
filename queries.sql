-- 1. Hetkel välja laenutatud raamatud (tagastamata)
-- Selgitus: Näitab, millised raamatud on liikmete käes ja pole veel tagastatud. Kasulik raamatukoguhoidjale laenude jälgimiseks.
-- Oodatav tulemus: Raamatu pealkiri, laenutaja nimi, laenutuse ja tähtaeg.
SELECT
  b.bookname AS 'Raamatu pealkiri',
  m.name AS 'Laenutaja nimi',
  l.loaned_date AS 'Laenutuse kuupäev',
  l.due_date AS 'Tagastamise tähtaeg'
FROM Loan l
JOIN Book b ON l.book_id = b.id
JOIN Member m ON l.member_id = m.id
WHERE l.returned_date IS NULL
ORDER BY l.due_date;

-- 2. Enimlaenutatud raamatud (TOP 10)
-- Selgitus: Raamatukogu saab otsustada, milliseid raamatuid juurde tellida.
-- Oodatav tulemus: Raamatu pealkiri, autor, laenutuste arv.
SELECT
  b.bookname AS 'Raamatu pealkiri',
  a.name AS 'Autor',
  COUNT(l.id) AS 'Laenutuste arv'
FROM Book b
JOIN Author a ON b.author_id = a.id
JOIN Loan l ON l.book_id = b.id
GROUP BY b.id, b.bookname, a.name
ORDER BY COUNT(l.id) DESC
LIMIT 10;

-- 3. Liikmed, kes pole kunagi raamatuid laenutanud
-- Selgitus: Saab tuvastada passiivseid liikmeid, kellele võiks saata meeldetuletusi või pakkumisi.
-- Oodatav tulemus: Liikme nimi ja e-post.
SELECT
  m.name AS 'Liikme nimi',
  m.email AS 'E-post'
FROM Member m
LEFT JOIN Loan l ON m.id = l.member_id
WHERE l.id IS NULL;

-- 4. Autorid, kelle raamatuid pole kordagi laenutatud
-- Selgitus: Saab hinnata, millised autorid on vähepopulaarsed.
-- Oodatav tulemus: Autori nimi, raamat.
SELECT
  a.name AS 'Autor',
  b.bookname AS 'Raamat'
FROM Author a
JOIN Book b ON b.author_id = a.id
LEFT JOIN Loan l ON l.book_id = b.id
WHERE l.id IS NULL;

-- 5. Iga liikme aktiivsete laenude arv (tagastamata raamatud)
-- Selgitus: Saab jälgida, kellel on mitu raamatut korraga.
-- Oodatav tulemus: Liikme nimi, aktiivsete laenude arv.
SELECT
  m.name AS 'Liikme nimi',
  COUNT(l.id) AS 'Aktiivsete laenude arv'
FROM Member m
LEFT JOIN Loan l ON m.id = l.member_id AND l.returned_date IS NULL
GROUP BY m.id, m.name
HAVING COUNT(l.id) > 0
ORDER BY COUNT(l.id) DESC;

-- 6. Iga autori raamatute keskmine laenutuste arv
-- Selgitus: Statistika, millised autorid on kõige populaarsemad.
-- Oodatav tulemus: Autori nimi, raamatute arv, keskmine laenutuste arv.
SELECT
  a.name AS 'Autor',
  COUNT(DISTINCT b.id) AS 'Raamatute arv',
  AVG(loan_count) AS 'Keskmine laenutuste arv'
FROM Author a
JOIN Book b ON b.author_id = a.id
LEFT JOIN (
  SELECT book_id, COUNT(*) AS loan_count
  FROM Loan
  GROUP BY book_id
) lc ON lc.book_id = b.id
GROUP BY a.id, a.name
ORDER BY AVG(loan_count) DESC;
