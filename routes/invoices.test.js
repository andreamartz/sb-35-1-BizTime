// connect to the correct DB --- set before loading db.js
process.env.NODE_ENV = "test";

// npm packages
const request = require("supertest");

// app imports
const app = require("../app");
const db = require("../db");

let testInvoice;

beforeEach(async function() {
  // Add data for company(-ies)
  await db.query(`INSERT INTO companies (code, name, description) VALUES ('erik', 'Erik''s Bikes', 'Your local bike store') RETURNING code, name, description`);

  // Add data for invoice(s)
  const result = await db.query(`
    INSERT INTO invoices (comp_code, amt, paid, add_date, paid_date) 
      VALUES ('erik', 100, false, '2020-12-03', null) RETURNING comp_code, amt, paid, add_date, paid_date`);
  testInvoice = result.rows[0];
  console.log("testInvoice: ", testInvoice);
});

afterEach(async function() {
  // delete any data created by test
  await db.query('DELETE FROM invoices');
  await db.query('DELETE FROM companies');
});

afterAll(async function() {
  // close db connection
  await db.end();
});

describe("GET /invoices", () => {
  test("Get an array with one invoice", async () => {
    const res = await request(app).get('/invoices');
    expect(res.statusCode).toBe(200);   // toBe compares the reference in memory, not just the values
    // expect(res.body).toEqual({ invoices: [testInvoice] } );
  });
});

// describe("GET /companies/:code", () => {
//   test("Gets a single company", async () => {
//     const res = await request(app).get(`/companies/${testCompany.code}`);
//     expect(res.statusCode).toBe(200);   
//     expect(res.body).toEqual({
//       company: testCompany
//     });
//   });
//   test("Responds with a 404 for invalid id", async () => {
//     const res = await request(app).get(`/companies/0`);
//     expect(res.statusCode).toBe(404);   
//   });
// });











// ****************************
// beforeEach(createData);

// afterEach(async function() {
//   // delete any data created by test
//   await db.query('DELETE FROM invoices');
// });

// afterAll(async function() {
//   // close db connection
//   await db.end();
// });

// describe("GET /invoices", () => {
//   test("Get an array with one invoice", async () => {
//     const res = await request(app).get('/invoices');
//     expect(1).toBe(1);
//     expect(res.statusCode).toBe(200);   // toBe compares the reference in memory, not just the values
//     expect(res.body).toEqual({ invoices: [testInvoice]} );
//   });
// });

// describe("GET /invoices/:id", () => {
//   test("Gets a single company", async () => {
//     const res = await request(app).get(`/invoices/${testInvoice.id}`);
//     expect(res.statusCode).toBe(200);   
//     expect(res.body).toEqual({
//       invoice: testInvoice
//     });
//   });
//   test("Responds with a 404 for invalid id", async () => {
//     const res = await request(app).get(`/invoices/0`);
//     expect(res.statusCode).toBe(404);   
//   });
// });