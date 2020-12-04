const express = require("express");
const router = express.Router();
const db = require("../db");
const ExpressError = require("../expressError");

router.get('/', async (req, res, next) => {
  try {
    const results = await db.query(`SELECT id, comp_code FROM invoices`);
    return res.json({invoices: results.rows});
  } catch (err) {
    return next(err);  // alternatively, we could pass in a new Express error and write a custom msg and custom status code
  }
});

router.get('/:id', async (req, res, next) => {
  const { id } = req.params;
  try {
    const result = await db.query(
      `SELECT i.id,
              i.amt, 
              i.paid, 
              i.add_date, 
              i.paid_date,
              i.comp_code,
              c.name,
              c.description
      FROM invoices as i
      INNER JOIN companies as c ON (i.comp_code = c.code)
      WHERE id = $1`, [id]
    );
    if (result.rows.length === 0) {
      throw new ExpressError(`No such company: ${id}`, 404)
    }
    const data = result.rows[0];
    const invoice = {
      id: data.id,
      amt: data.amt,
      paid: data.paid,
      add_date: data.add_date,
      paid_date: data.paid_date
    }
    const company = {
      code: data.comp_code,
      name: data.name,
      description: data.description
    }
    invoice.company = company;

    return res.json({ invoice: invoice });

  } catch (err) {
    return next(err);
  }
})

router.post('/', async function(req, res, next) {
  try {
    const { comp_code, amt } = req.body;
    const results = await db.query(`
      INSERT INTO invoices (comp_code, amt)
      VALUES ($1, $2)
      RETURNING id, comp_code, amt, paid, add_date, paid_date`,
      [comp_code, amt]
    );
    return res.status(201).json({ invoice: results.rows[0] });
  } catch (err) {
    return next(err);
  };
});

module.exports = router;