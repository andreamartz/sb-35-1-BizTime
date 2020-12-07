const express = require("express");
const router = express.Router();
const db = require("../db");
const ExpressError = require("../expressError");

// WORKS to get just industry info with associated companies
// router.get('/', async function (req, res, next) {
//   try {
//     const results =  await db.query(`
//       SELECT code, industry FROM industries`
//     );
//     console.log(results.rows);
//     return res.json({ industries: results.rows });
//   } catch (err) {
//     return next(err);
//   }
// })

router.get('/', async function (req, res, next) {
  // same route as above, but add companies array to each industry
  try {
    // get industry info from db
    const results = await db.query(`
      SELECT ind.code AS ind_code, ind.industry
        FROM industries AS ind`
    );

    // get company information for each industry; returns an array of promises
    let outArr = results.rows.map(i => {
      // infoPromises will be an array of promises bc Array.map is a synchronous method
      let infoPromises =[];

      let industry_code = i.ind_code;
      let info = db.query(`
        SELECT ind.code AS ind_code, ind.industry, c.code AS comp_code
          FROM industries AS ind
          LEFT JOIN companies_industries AS ci
            ON ind.code = ci.ind_code
          LEFT JOIN companies AS c
            ON ci.comp_code = c.code
        WHERE ind.code = $1`, [industry_code]
      );
      infoPromises.push(info);
      return infoPromises;
    });
    
    let infoPromises = outArr.map(p => p[0]);
    
    return Promise.all(infoPromises)
      .then(results => {
        let outObj = {};
        outObj.industries = [];

        // nested loop to create industry object and push it onto the object to be returned
        for (result of results) {
          let resObj = {};
          resObj.ind_code = result.rows[0].ind_code;
          resObj.industry = result.rows[0].industry;
          resObj.companies = [];
          for (result of result.rows) {
            resObj.companies.push(result.comp_code);
          }
          outObj.industries.push(resObj);
        }

        return res.json(outObj);
      })
      .catch(err => console.log("error: ", err));
    
  } catch (err) {
    return next(err);
  }
});

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
});

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