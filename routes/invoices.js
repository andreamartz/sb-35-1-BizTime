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

router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      `SELECT id, amt, paid, add_date, paid_date,comp_code
      FROM invoices
      WHERE id = $1`, [id]
    );
    if (result.rows.length === 0) {
      throw new ExpressError(`No such company: ${id}`, 404)
    } else {
      return res.json({ invoice: result.rows[0] });
    }
  } catch (err) {
    return next(err);
  }
})

module.exports = router;