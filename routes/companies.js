const express = require("express");
const router = express.Router();
const db = require("../db");

router.get('/', async (req, res, next) => {
  const results = await db.query(`SELECT * FROM companies`);
  return res.json(results.rows);
})

module.exports = router;