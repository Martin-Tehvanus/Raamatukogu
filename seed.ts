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

async function insertAuthors() {
  for (let i = 0; i < AUTHOR_COUNT; i += BATCH_SIZE) {
    const values = [];
    for (let j = 0; j < BATCH_SIZE && i + j < AUTHOR_COUNT; j++) {
      values.push([
        faker.person.fullName(),
        faker.lorem.sentence(),
        faker.date.past().toISOString().slice(0, 19).replace('T', ' '),
      ]);
    }
    await pool.query(
      'INSERT INTO Author (name, bio, created_at) VALUES ?',
      [values]
    );
    console.log(`Inserted authors: ${i + values.length}`);
  }
}

async function insertMembers() {
  for (let i = 0; i < MEMBER_COUNT; i += BATCH_SIZE) {
    const values = [];
    for (let j = 0; j < BATCH_SIZE && i + j < MEMBER_COUNT; j++) {
      values.push([
        faker.person.fullName(),
        faker.internet.email(),
        faker.date.past().toISOString().slice(0, 19).replace('T', ' '),
      ]);
    }
    await pool.query(
      'INSERT INTO Member (name, email, registered_time) VALUES ?',
      [values]
    );
    console.log(`Inserted members: ${i + values.length}`);
  }
}

async function insertBooks() {
  for (let i = 0; i < BOOK_COUNT; i += BATCH_SIZE) {
    const values = [];
    for (let j = 0; j < BATCH_SIZE && i + j < BOOK_COUNT; j++) {
      const authorId = faker.number.int({ min: 1, max: AUTHOR_COUNT });
      values.push([
        faker.lorem.words({ min: 2, max: 6 }),
        authorId,
        faker.lorem.paragraph(),
        faker.date.past().toISOString().slice(0, 10),
        faker.date.past().toISOString().slice(0, 19).replace('T', ' '),
      ]);
    }
    await pool.query(
      'INSERT INTO Book (bookname, author_id, book_description, published_date, added_time) VALUES ?',
      [values]
    );
    console.log(`Inserted books: ${i + values.length}`);
  }
}

async function insertLoans() {
  for (let i = 0; i < LOAN_COUNT; i += BATCH_SIZE) {
    const values = [];
    for (let j = 0; j < BATCH_SIZE && i + j < LOAN_COUNT; j++) {
      const bookId = faker.number.int({ min: 1, max: BOOK_COUNT });
      const memberId = faker.number.int({ min: 1, max: MEMBER_COUNT });
      const loanedDate = faker.date.past();
      const dueDate = new Date(loanedDate);
      dueDate.setDate(dueDate.getDate() + faker.number.int({ min: 7, max: 30 }));
      let returnedDate = null;
      if (faker.datatype.boolean()) {
        returnedDate = new Date(loanedDate);
        returnedDate.setDate(returnedDate.getDate() + faker.number.int({ min: 1, max: 60 }));
        returnedDate = returnedDate.toISOString().slice(0, 10);
      }
      values.push([
        bookId,
        memberId,
        loanedDate.toISOString().slice(0, 19).replace('T', ' '),
        dueDate.toISOString().slice(0, 10),
        returnedDate,
      ]);
    }
    await pool.query(
      'INSERT INTO Loan (book_id, member_id, loaned_date, due_date, returned_date) VALUES ?',
      [values]
    );
    console.log(`Inserted loans: ${i + values.length}`);
  }
}

async function main() {
  await insertAuthors();
  await insertMembers();
  await insertBooks();
  await insertLoans();
  await pool.end();
  console.log('Seemendamine valmis!');
}

main().catch(console.error);
