const express = require("express");
const router = express.Router();
const db = require("../db");
const ExpressError = require("../expressError");

router.get('/', async (req, res, next) => {
  try {
    const results = await db.query(`SELECT * FROM invoices`);
    return res.json({invoices: results.rows});
  } catch (err) {
    return next(err);  // alternatively, we could pass in a new Express error and write a custom msg and custom status code
  }
});



module.exports = router;