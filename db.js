"use strict";
/** Database setup for jobly. */
const { Client } = require("pg");
const { getDatabaseUri } = require("./config");

let db;

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

// let DB_URI = getDatabaseUri();

// if (process.env.NODE_ENV === "production") {
//   DB_URI.ssl = {
//     rejectUnauthorized: false
//   }
// }
// // db = new Client(DB_URI);
// // } else {
// db = new Client(DB_URI);
// // }

db.connect();

module.exports = db;