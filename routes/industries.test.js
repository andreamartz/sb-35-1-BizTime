// connect to the correct DB --- set before loading db.js
process.env.NODE_ENV = "test";

// npm packages
const request = require("supertest");

// app imports
const app = require("../app");
const db = require("../db");

let testIndustry;

beforeEach(async function() {
  // Add data for company(-ies)
  await db.query(`INSERT INTO companies (code, name, description) VALUES ('erik', 'Erik''s Bikes', 'Your local bike store'),
    ('sew', 'Sue''s Garment Repair', 'Best repairs') RETURNING code, name, description`);

  // Add data for industry(-ies)
  const result = await db.query(`
    INSERT INTO industries (code, industry) 
      VALUES ('mech', 'Mechanical'),
        ('tr', 'Trades')
      RETURNING code, industry`);
  testIndustry = result.rows[1];
  console.log("testIndustry: ", testIndustry);

  // Add companies_industries
  await db.query(`
  INSERT INTO companies_industries (comp_code, ind_code)
  VALUES ('erik', 'mech'), ('erik', 'tr'), ('sew', 'tr')
  RETURNING comp_code, ind_code`);
});

afterEach(async function() {
  // delete any data created by test
  // await db.query('DELETE FROM invoices');
  await db.query('DELETE FROM companies');
  await db.query('DELETE FROM industries');
});

afterAll(async function() {
  // close db connection
  await db.end();
});

describe("GET /industries", () => {
  test("Get an array with two industries", async () => {
    const res = await request(app).get(`/industries`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      "industries": [ {ind_code: "mech", industry: "Mechanical", companies: expect.any(Array)}, 
      {ind_code: "tr", industry: "Trades", companies: expect.any(Array)}]
    });
  });
});

describe("GET /industries/:ind_code", () => {
  test("Gets a single industry", async () => {
    const res = await request(app).get(`/industries/${testIndustry.code}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      ind_code: testIndustry.code,
      industry: testIndustry.industry,
      companies: ["erik", "sew"]
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

