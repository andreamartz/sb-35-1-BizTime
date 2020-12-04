// connect to the correct DB --- set before loading db.js
process.env.NODE_ENV = "test";

// npm packages
const request = require("supertest");

// app imports
const app = require("../app");
const db = require("../db");


let testCompany;

// Note the two single quotes in 'Erik''s Bikes': The first one escapes the second one (somehow)
beforeEach(async function() {
  // Add company(-ies)
  const result = await db.query(`INSERT INTO companies (code, name, description) VALUES ('erik', 'Erik''s Bikes', 'Your local bike store') RETURNING code, name, description`);
  testCompany = result.rows[0];

  // Add invoice(s)
  // await db.query("SELECT setval('invoices_id_seq', 1, false)");
  await db.query(`
  INSERT INTO invoices (comp_code, amt, paid, add_date, paid_date) 
    VALUES ('erik', 100, false, '2020-12-03', null) RETURNING id, comp_code, amt, paid, add_date, paid_date`);
});

afterEach(async function() {
  // delete any data created by test
  await db.query('DELETE FROM companies');
  await db.query('DELETE FROM invoices');
});

afterAll(async function() {
  // close db connection
  await db.end();
});

describe("GET /companies", () => {
  test("Get an array with one company", async () => {
    const res = await request(app).get('/companies');
    expect(res.statusCode).toBe(200);   // toBe compares the reference in memory, not just the values
    expect(res.body).toEqual({ companies: [testCompany] } );
  });
});

describe("GET /companies/:code", () => {
  test("Gets a single company", async () => {
    const res = await request(app).get(`/companies/${testCompany.code}`);
    expect(res.statusCode).toBe(200);   
    expect(res.body).toEqual({
      "company": { 
        code: testCompany.code,
        name: testCompany.name,
        description: testCompany.description,
        invoices: [ expect.any(Number) ]
      }
    });
  });
  test("Responds with a 404 for invalid id", async () => {
    const res = await request(app).get(`/companies/0`);
    expect(res.statusCode).toBe(404);   
  });
});

describe("POST /companies", () => {
  test("Creates a single company", async () => {
    const res = await request(app).post('/companies')
      .send({ code: 'companyx',
      name: 'Company X',
      description: 'A great company!'
      }
    );
    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({ 
      company: { code: expect.any(String),
        name: "Company X",
        description: "A great company!"}});
  });
});

describe("PUT /companies/code", () => {
  test("Updates a single company", async () => {
    const res = await request(app).put(`/companies/${testCompany.code}`)
      .send({ name: 'Company Y',
      description: 'A great company to work for!'
      }
    );
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ 
      company: { code: testCompany.code,
        name: "Company Y",
        description: "A great company to work for!"
      }
    });
  });
  test("Responds with 404 for invalid code", async () => {
    const res = await request(app).put(`/companies/nosuchcompany`)
      .send({ name: 'Company Y',
      description: 'A great company to work for!'
      }
    );
    expect(res.statusCode).toBe(404);
  });
});

describe("DELETE /companies/code", () => {
  test("Deletes a single company", async () => {
    const res = await request(app).delete(`/companies/${testCompany.code}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ message: "Deleted" });
  });
  test("Responds with 404 for invalid code", async () => {
    const res = await request(app).delete(`/companies/nosuchcompany`);
    expect(res.statusCode).toBe(404);
  });
});