"use strict";
/** Database setup for jobly. */
const { Client } = require("pg");
const { getDatabaseUri } = require("./config");

let db;

/** Springboard Method */
// if (process.env.NODE_ENV === "production") {
//   db = new Client({
//     connectionString: getDatabaseUri(),
//     ssl: {
//       rejectUnauthorized: false
//     }
//   });
// } else {
//   db = new Client({
//     connectionString: getDatabaseUri()
//   });
// }
/** END Springboard Method */


/** My Method */
if (process.env.NODE_ENV === "production") {
  db = new Client({
    host: "localhost",
    user: "pete", // your username 
    password: "vampire", // your password
    database: getDatabaseUri(),
    ssl: {
      rejectUnauthorized: false
    }
  });
} else {
  db = new Client({
    host: "localhost",
    user: "pete", // your username 
    password: "vampire", // your password
    database: getDatabaseUri()
  });
}
/** END My Method */


db.connect();

module.exports = db;