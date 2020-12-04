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
      VALUES ('erik', 100, false, '2020-12-03', null) RETURNING id, comp_code, amt, paid, add_date, paid_date`);
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
    expect(res.body).toEqual({ "invoices": 
      [ 
        { 
          id: testInvoice.id, 
          comp_code: testInvoice.comp_code 
        }
      ]
    });
  });
});

describe("GET /invoices/:id", () => {
  test("Gets a single invoice", async () => {
    const res = await request(app).get(`/invoices/${testInvoice.id}`);
    expect(res.statusCode).toBe(200);   
    expect(res.body).toEqual({
      "invoice": {
        id: testInvoice.id,
        amt: testInvoice.amt,
        paid: testInvoice.paid,
        add_date: "2020-12-03T06:00:00.000Z",
        paid_date: testInvoice.paid_date,
        "company": {
          code: "erik",
          name: "Erik's Bikes",
          description: "Your local bike store"
        }
      }
    });
  });
  test("Responds with a 404 for invalid id", async () => {
    const res = await request(app).get(`/invoices/0`);
    expect(res.statusCode).toBe(404);   
  });
});