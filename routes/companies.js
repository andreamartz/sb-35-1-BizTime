const express = require("express");
const router = express.Router();
const db = require("../db");
const slugify = require('slugify');
const ExpressError = require("../expressError");

router.get('/', async (req, res, next) => {
  try {
    const results = await db.query(`SELECT * FROM companies`);
    return res.json({ companies: results.rows });
  } catch (err) {
    return next(err);   // alternatively, we could pass in a new Express error and write a custom msg and custom status code
  }
});

router.get('/:code', async (req, res, next) => {
  try {
    const { code } = req.params;
    const companyResults = await db.query(`
      SELECT c.code, 
             c.name, 
             c.description,
             ind.industry 
      FROM companies AS c
      LEFT JOIN companies_industries AS ci
      ON c.code = ci.comp_code
      LEFT JOIN industries AS ind
      ON ind.code = ci.ind_code
      WHERE c.code = $1`, [code]
    );
    const invoiceResults = await db.query(`
      SELECT id
      FROM invoices
      WHERE comp_code = $1`, 
      [code]
    )
    console.log("companyResults.rows: ", companyResults.rows);
    if (companyResults.rows.length === 0) {
      throw new ExpressError(`No such company: ${code}`, 404)
    }
    const company = {...companyResults.rows[0]};
    delete company.industry;

    company.invoices = invoiceResults.rows.map(inv => inv.id);
    company.industries = companyResults.rows.map(company => company.industry);
    console.log("company: ", company);
    return res.json({ company: company });
  } catch(err) {
    return next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    let { name, description } = req.body;
    let code = slugify(name, { lower: true, remove: /[*+~!:@]/g });
    const results = await db.query(`INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING code, name, description`, [code, name, description]);
    return res.status(201).json({ company: results.rows[0] });
  } catch (err) {
    return next(err);
  }
});

router.put('/:code', async (req, res, next) => {
  try {
    const { code } = req.params;
    const { name, description } = req.body;
    
    const result = await db.query(
      `UPDATE companies SET name=$2, description=$3
      WHERE code = $1
      RETURNING code, name, description`, [code, name, description]
    );
    if (result.rows.length === 0) {
      throw new ExpressError(`No such company: ${code}`, 404)
    } else {
      return res.json({ company: result.rows[0] });
    }
  } catch(err) {
    return next(err);
  }
});

router.post('/:code', async (req, res, next) => {
  try {
    const { code } = req.params;
    const { ind_code } = req.body;

    const result = await db.query(
      `INSERT INTO companies_industries (comp_code, ind_code)
      VALUES ($1, $2)
      RETURNING comp_code, ind_code`, [code, ind_code]
    );
    if (result.rows.length === 0) {
      throw new ExpressError(`No such company: ${code}`, 404)
    } else {
      return res.status(201).json({ company_industry: result.rows[0] });
    }
  } catch(err) {
    return next(err);
  }
});

router.delete('/:code', async (req, res, next) => {
  try {
    const { code } = req.params;
    const result = await db.query(
      "DELETE FROM companies WHERE code = $1 RETURNING code", 
      [code]
    );
    if (result.rows.length === 0) {
      throw new ExpressError(`No such company: ${code}`, 404)
    } else {
      return res.json({ message: "Deleted" });
    }
  } catch(err) {
    return next(err);
  }
});

module.exports = router;