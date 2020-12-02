/** Database setup for BizTime. */
const { Client } = require("pg");

let DB_URI;

if (process.env.NODE_ENV === "test") {
  DB_URI = "postgresql:///biztime_test";
} else {
  DB_URI = "postgresql:///biztime";
}

// an object that has a property `connectionString` to tell Node the URI of our database
let db = new Client({
  connectionString: DB_URI
});

db.connect();    // starts up our connection

module.exports = db;