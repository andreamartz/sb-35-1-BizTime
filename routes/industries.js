const express = require("express");
const router = express.Router();
const db = require("../db");
const ExpressError = require("../expressError");

router.get('/', async function (req, res, next) {
  try {
    const results =  await db.query(`
      SELECT code, industry FROM industries`
    );
    console.log(results.rows);
    return res.json({ industries: results.rows });
  } catch (err) {
    return next(err);
  }
})

router.get('/:ind_code', async function (req, res, next) {
  try {
    const { ind_code } = req.params;
    const results =  await db.query(`
      SELECT ind.code AS ind_code, ind.industry, c.code AS comp_code
        FROM industries AS ind
        LEFT JOIN companies_industries AS ci
          ON ind.code = ci.ind_code
        LEFT JOIN companies AS c
          ON ci.comp_code = c.code
      WHERE ind_code = $1`, [req.params.ind_code]
    );
    console.log("results.rows: ", results.rows);
    let { industry } = results.rows[0];
    let companies = results.rows.map(r => r.comp_code); // an array of company codes
    return res.json({ ind_code, industry, companies });
  } catch (err) {
    return next(err);
  }
})

router.post('/', async function (req, res, next) {
  try {
    const { code, industry } = req.body;
    const results = await db.query(`
      INSERT INTO industries (code, industry)
      VALUES ($1, $2)
      RETURNING code, industry`,
      [code, industry]
    );
    return res.status(201).json({ industry: results.rows[0]});
  } catch (err) {
    return next(err);
  }
});

module.exports = router;