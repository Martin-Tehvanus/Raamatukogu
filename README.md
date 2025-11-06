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

### Docker Compose variandina
- Kohanda `.env` (vaikimisi sobib hostilt ühendudes: `DB_HOST=localhost`).
- Käivita teenused:
  ```sh
  docker compose up -d
  ```
- Lae skeem konteinerisse:
  ```sh
  docker exec -i library-mysql mysql -uroot -p"$env:DB_PASS" "$env:DB_NAME" < dump.sql
  ```
  PowerShellis asenda keskkonnamuutujad vastavalt; Bashis kasuta `$DB_PASS`/`$DB_NAME`.

## Kiirstart (nullist)
Alljärgnev sobib algajale – samm-sammult, kuni andmed on sees.

1) Klooni repo oma masinasse
```sh
git clone https://github.com/Martin-Tehvanus/Raamatukogu
cd Raamatukogu
```

2) Paigalda tööriistad
- Installi Docker Desktop ja veendu, et see töötab (WSL2 Windowsis).
- Installi Bun (https://bun.sh) ja Git.

3) Loo `.env` fail (samasse kausta)
```env
DB_HOST=localhost
DB_USER=root
DB_PASS=rootpass
DB_NAME=Raamatukogu
```

4) Käivita andmebaas konteineris
```sh
docker compose up -d
```

5) Lae skeem konteinerisse (vali sobiv käsuvariant)
- Windows PowerShell:
```powershell
docker exec -i library-mysql mysql -uroot -p"$env:DB_PASS" "$env:DB_NAME" < dump.sql
```
- Bash (macOS/Linux):
```bash
docker exec -i library-mysql mysql -uroot -p"$DB_PASS" "$DB_NAME" < dump.sql
```

6) Paigalda sõltuvused ja käivita seemendus
```sh
bun install
bun run seed.ts
```

7) Kontrolli, et read on sees (vali üks)
- MySQL CLI konteineris:
```sh
docker exec -it library-mysql mysql -uroot -p"$DB_PASS" -e "SELECT COUNT(*) AS Authors FROM Author; SELECT COUNT(*) AS Members FROM Member; SELECT COUNT(*) AS Books FROM Book; SELECT COUNT(*) AS Loans FROM Loan;" "$DB_NAME"
```
- phpMyAdmin: ava brauseris http://localhost:8080 (user: `root`, pass: `.env` DB_PASS), vaata tabelite COUNT().

8) Peata teenused (soovi korral)
```sh
docker compose down
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
- Sõltub masinast; eeldatavalt 10–60 minutit

## Optimeerimise strateegia
- Sisestuse ajal (sessioonipõhised seaded):
  - `SET FOREIGN_KEY_CHECKS=0`
  - `SET UNIQUE_CHECKS=0`
  - `SET autocommit=0`
- Partiipõhised transaktsioonid iga batch’i kohta (`BEGIN`/`COMMIT`).
- Sõltumatud osad paralleelselt: `Author` + `Member` sisestatakse `Promise.all` abil.
- Pärast sisestust taastatakse seaded (`=1`).

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
