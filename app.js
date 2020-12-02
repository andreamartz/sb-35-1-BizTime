/** BizTime express application. */


const express = require("express");

const app = express();
const ExpressError = require("./expressError")

app.use(express.json());

const companyRoutes = require("./routes/companies");
const invoiceRoutes = require("./routes/invoices");

app.use("/companies", companyRoutes);
app.use("/invoices", invoiceRoutes);

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
  
app.listen(3000, function() {
  console.log("Server started on port 3000");
});
