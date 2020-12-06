/** BizTime express application. */

const express = require("express");

const app = express();
const ExpressError = require("./expressError")

// middleware to parse incoming request body as JSON
app.use(express.json());

const companyRoutes = require("./routes/companies");
const invoiceRoutes = require("./routes/invoices");
const industryRoutes = require("./routes/industries");

app.use("/companies", companyRoutes);
app.use("/invoices", invoiceRoutes);
app.use("/industries", industryRoutes);

/** 404 handler */

app.use(function(req, res, next) {
  const err = new ExpressError("Not Found", 404);
  return next(err);
});

/** general error handler */

app.use((err, req, res, next) => {
  // the default status is 500 Internal Server Error
  let status = err.status || 500;

  // set the status and alert the user
  return res.status(status).json({
    error: {
      message: err.message,
      status: status
    }
  });
});
  
module.exports = app;
