# Raamatukogu

## Eeldused
- MySQL/MariaDB v8+ (soovitatav Dockeriga)
- Bun (https://bun.sh)
- dump.sql skeem olemas
- .env fail (DB_HOST, DB_USER, DB_PASS, DB_NAME)

## Sammud

1. **Andmebaasi loomine ja skeemi laadimine**
   ```sh
   mysql -u <user> -p < dump.sql
   ```
   või Dockeriga:
   ```sh
   docker run --name mysql -e MYSQL_ROOT_PASSWORD=salasõna -e MYSQL_DATABASE=Raamatukogu -p 3306:3306 -d mysql:8
   docker exec -i mysql mysql -u root -psalasõna Raamatukogu < dump.sql
   ```


2. **Kõigi Eelduste paigaldus**
   ```sh
   bun install
   ```
   See paigaldab kõik vajalikud teegid automaatselt package.json põhjal.

3. **Seemneskripti käivitamine**
   ```sh
   bun run seed.ts
   ```

## Oodatav tulemus
- Tabelis `Book` on vähemalt 2 000 000 rida
- Tabelis `Author` ~100 000 rida
- Tabelis `Member` ~500 000 rida
- Tabelis `Loan` ~5 000 000 rida
- Kõik andmed on ehtsad (nimed, e-kirjad, kuupäevad, seosed)
- FK terviklus tagatud, orvukirjeid pole
- Sisestus toimub partiidena, jõudluslikult
- Lahendus on reprodutseeritav (fikseeritud seeme)

## Kestus
- Sõltub masinast, eeldatavalt 10-60 minutit

## Ehtsuse ja tervikluse kirjeldus
- Nimed, e-kirjad, kuupäevad, kirjeldused on genereeritud fakeriga
- Kõik FK-d kehtivad, orvukirjeid pole
- Andmed on proportsionaalsed ja realistlikud

## Probleemide korral
- Kontrolli .env väärtusi ja andmebaasi ühendust
- Veendu, et dump.sql skeem on laaditud
- Vajadusel vähenda BATCH_SIZE väärtust skriptis

---
-
Repo struktuur:
- dump.sql
- seed.ts
- README.md
- package.json
