const express = require("express");
const router = express.Router();
const db = require("../db");
const ExpressError = require("../expressError");

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