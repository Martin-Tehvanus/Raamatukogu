// Seemneskript Bun-iga: täidab dump.sql skeemi suurandmetega
// Kasutab fakerit, partiipõhist sisestust, reprodutseeritav (fikseeritud seeme)

import { faker } from '@faker-js/faker';
import { createPool } from 'mysql2/promise';

const SEED = 12345;
faker.seed(SEED);

const AUTHOR_COUNT = 100_000;
const MEMBER_COUNT = 500_000;
const BOOK_COUNT = 2_000_000;
const LOAN_COUNT = 5_000_000;
const BATCH_SIZE = 10_000;

const pool = createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'Raamatukogu',
  multipleStatements: true,
  connectionLimit: 10,
});

function safeDatePast(): Date {
  // Vältida DST "auke" (nt 2025-03-30 03:00–03:59)
  // Kontroll toimub UTC järgi, et vältida piirkonna eripärasid.
  // NB! faker.date.past() võib anda ka tulevikku sõltuvalt versioonist; hoiame loogika samana.
  // Kordame kuni aeg sobib.
  for (;;) {
    const d = faker.date.past();
    const y = d.getUTCFullYear();
    const m = d.getUTCMonth() + 1;
    const day = d.getUTCDate();
    const h = d.getUTCHours();
    if (!(y === 2025 && m === 3 && day === 30 && h === 3)) return d;
  }
}

async function insertAuthors() {
  const conn = await pool.getConnection();
  try {
    await conn.query('SET FOREIGN_KEY_CHECKS=0');
    await conn.query('SET UNIQUE_CHECKS=0');
    await conn.query('SET autocommit=0');

    for (let i = 0; i < AUTHOR_COUNT; i += BATCH_SIZE) {
      const values: any[] = [];
      for (let j = 0; j < BATCH_SIZE && i + j < AUTHOR_COUNT; j++) {
        const created = safeDatePast();
        values.push([
          faker.person.fullName(),
          faker.lorem.sentence(),
          created.toISOString().slice(0, 19).replace('T', ' '),
        ]);
      }
      await conn.beginTransaction();
      await conn.query(
        'INSERT INTO Author (name, bio, created_at) VALUES ?',
        [values]
      );
      await conn.commit();
      console.log(`Inserted authors: ${i + values.length}`);
    }
  } finally {
    await conn.query('SET FOREIGN_KEY_CHECKS=1');
    await conn.query('SET UNIQUE_CHECKS=1');
    await conn.query('SET autocommit=1');
    conn.release();
  }
}

async function insertMembers() {
  const conn = await pool.getConnection();
  try {
    await conn.query('SET FOREIGN_KEY_CHECKS=0');
    await conn.query('SET UNIQUE_CHECKS=0');
    await conn.query('SET autocommit=0');

    for (let i = 0; i < MEMBER_COUNT; i += BATCH_SIZE) {
      const values: any[] = [];
      for (let j = 0; j < BATCH_SIZE && i + j < MEMBER_COUNT; j++) {
        const reg = safeDatePast();
        values.push([
          faker.person.fullName(),
          faker.internet.email(),
          reg.toISOString().slice(0, 19).replace('T', ' '),
        ]);
      }
      await conn.beginTransaction();
      await conn.query(
        'INSERT INTO Member (name, email, registered_time) VALUES ?',
        [values]
      );
      await conn.commit();
      console.log(`Inserted members: ${i + values.length}`);
    }
  } finally {
    await conn.query('SET FOREIGN_KEY_CHECKS=1');
    await conn.query('SET UNIQUE_CHECKS=1');
    await conn.query('SET autocommit=1');
    conn.release();
  }
}

async function insertBooks() {
  const conn = await pool.getConnection();
  try {
    await conn.query('SET FOREIGN_KEY_CHECKS=0');
    await conn.query('SET UNIQUE_CHECKS=0');
    await conn.query('SET autocommit=0');

    for (let i = 0; i < BOOK_COUNT; i += BATCH_SIZE) {
      const values: any[] = [];
      for (let j = 0; j < BATCH_SIZE && i + j < BOOK_COUNT; j++) {
        const authorId = faker.number.int({ min: 1, max: AUTHOR_COUNT });
        const publishedDate = safeDatePast();
        const addedTime = safeDatePast();
        values.push([
          faker.lorem.words({ min: 2, max: 6 }),
          authorId,
          faker.lorem.paragraph(),
          publishedDate.toISOString().slice(0, 10),
          addedTime.toISOString().slice(0, 19).replace('T', ' '),
        ]);
      }
      await conn.beginTransaction();
      await conn.query(
        'INSERT INTO Book (bookname, author_id, book_description, published_date, added_time) VALUES ?',
        [values]
      );
      await conn.commit();
      console.log(`Inserted books: ${i + values.length}`);
    }
  } finally {
    await conn.query('SET FOREIGN_KEY_CHECKS=1');
    await conn.query('SET UNIQUE_CHECKS=1');
    await conn.query('SET autocommit=1');
    conn.release();
  }
}

async function insertLoans() {
  const conn = await pool.getConnection();
  try {
    await conn.query('SET FOREIGN_KEY_CHECKS=0');
    await conn.query('SET UNIQUE_CHECKS=0');
    await conn.query('SET autocommit=0');

    for (let i = 0; i < LOAN_COUNT; i += BATCH_SIZE) {
      const values: any[] = [];
      for (let j = 0; j < BATCH_SIZE && i + j < LOAN_COUNT; j++) {
        const bookId = faker.number.int({ min: 1, max: BOOK_COUNT });
        const memberId = faker.number.int({ min: 1, max: MEMBER_COUNT });
        const loanedDate = safeDatePast();
        const dueDate = new Date(loanedDate);
        dueDate.setDate(dueDate.getDate() + faker.number.int({ min: 7, max: 30 }));
        let returnedDate: string | null = null;
        if (faker.datatype.boolean()) {
          const retDate = new Date(loanedDate);
          retDate.setDate(retDate.getDate() + faker.number.int({ min: 1, max: 60 }));
          returnedDate = retDate.toISOString().slice(0, 10);
        }
        values.push([
          bookId,
          memberId,
          loanedDate.toISOString().slice(0, 19).replace('T', ' '),
          dueDate.toISOString().slice(0, 10),
          returnedDate,
        ]);
      }
      await conn.beginTransaction();
      await conn.query(
        'INSERT INTO Loan (book_id, member_id, loaned_date, due_date, returned_date) VALUES ?',
        [values]
      );
      await conn.commit();
      console.log(`Inserted loans: ${i + values.length}`);
    }
  } finally {
    await conn.query('SET FOREIGN_KEY_CHECKS=1');
    await conn.query('SET UNIQUE_CHECKS=1');
    await conn.query('SET autocommit=1');
    conn.release();
  }
}

async function main() {
  console.log('Optimeerimiste seadistamine mass-sisestuse jaoks...');
  console.log('Alustan andmete sisestamist...');

  // Sõltumatud osad paralleelselt
  await Promise.all([
    insertAuthors(),
    insertMembers(),
  ]);

  // Sõltuvused
  await insertBooks();
  await insertLoans();

  await pool.end();
  console.log('Seemendamine valmis!');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

