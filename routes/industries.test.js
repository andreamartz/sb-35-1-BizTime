// connect to the correct DB --- set before loading db.js
process.env.NODE_ENV = "test";

// npm packages
const request = require("supertest");

// app imports
const app = require("../app");
const db = require("../db");

let testIndustry;

beforeEach(async function() {
//   // Add data for company(-ies)
//   await db.query(`INSERT INTO companies (code, name, description) VALUES ('erik', 'Erik''s Bikes', 'Your local bike store') RETURNING code, name, description`);

//   // Add data for invoice(s)
//   const result = await db.query(`
//     INSERT INTO invoices (comp_code, amt, paid, add_date, paid_date) 
//       VALUES ('erik', 100, false, '2020-12-03', null) RETURNING id, comp_code, amt, paid, add_date, paid_date`);
//   testInvoice = result.rows[0];
//   console.log("testInvoice: ", testInvoice);
// });

  // Add data for industry(-ies)
  const result = await db.query(`
    INSERT INTO industries (code, industry) 
      VALUES ('it', 'Information Technology')
      RETURNING code, industry`);
  testIndustry = result.rows[0];
  console.log("testIndustry: ", testIndustry);
});

afterEach(async function() {
  // delete any data created by test
  // await db.query('DELETE FROM invoices');
  // await db.query('DELETE FROM companies');
  await db.query('DELETE FROM industries');
});

// afterAll(async function() {
//   // close db connection
//   await db.end();
// });

// describe("GET /invoices", () => {
//   test("Get an array with one invoice", async () => {
//     const res = await request(app).get('/invoices');
//     expect(res.statusCode).toBe(200);   // toBe compares the reference in memory, not just the values
//     expect(res.body).toEqual({ "invoices": 
//       [ 
//         { 
//           id: testInvoice.id, 
//           comp_code: testInvoice.comp_code 
//         }
//       ]
//     });
//   });
// });

describe("GET /industries", () => {
  test("Get an array with one industry", async () => {
    const res = await request(app).get(`/industries`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      "industries": [testIndustry]
    });
  });
});

describe("POST /industries", () => {
  test("Creates a single industry", async () => {
    const res = await request(app).post('/industries')
      .send(
        { 
          code: 'admin',
          industry: 'Administration'
        }
    );
    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({ 
      industry: { 
          code: 'admin',
          industry: 'Administration'
      }
    });
  });
});

