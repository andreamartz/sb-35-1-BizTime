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

    // const industryResults = await db.query(`
    //   SELECT ind.code AS ind_code, ind.industry, c.code AS comp_code
    //   FROM industries as ind
    //   LEFT JOIN companies_industries AS ci
    //   ON ind_code = ci.ind_code
    //   LEFT JOIN companies AS c
    //   ON comp_code = ci.comp_code
    //   WHERE ind_code = $1`, [req.params.code]);
    // console.log("industryResults.rows: ", industryResults.rows);

    // if (industryResults.rows.length === 0) {
    //   throw new ExpressError(`No industries found: ${code}`, 404)
    // }
    // let { ind_code } = industryResults.rows[0];
    // let compCodes = industryResults.rows.map(r => r.comp_code);
    // return res.json({ind_code, comp_code, compCodes });
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