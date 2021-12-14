"use strict";

const e = require("express");
/** Convenience middleware to handle common auth cases in routes. */

const jwt = require("jsonwebtoken");
const { locals } = require("../app");
const { SECRET_KEY } = require("../config");
const { UnauthorizedError } = require("../expressError");


/** Middleware: Authenticate user.
 *
 * If a token was provided, verify it, and if valid, store the token payload
 * on res.locals (this will include the username and isAdmin field.)
 *
 * It's not an error if no token was provided or if the token is not valid.
 */

function authenticateJWT(req, res, next) {
  try {
    const authHeader = req.headers && req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace(/^[Bb]earer /, "").trim();
      res.locals.user = jwt.verify(token, SECRET_KEY);
    }
    next();
  } catch (err) {
    next();
  }
}

/** Middleware to use when they must be logged in.
 *
 * If not, raises Unauthorized.
 */

function ensureLoggedIn(req, res, next) {
  try {
    if (!res.locals.user) throw new UnauthorizedError();
    return next();
  } catch (err) {
    return next(err);
  }
}

/** Middleware to use when they must be logged in, and an admin.
 * 
 * If not, raises Unauthorized.
 */
function ensureAdmin(req, res, next) {
  try {
    if (!res.locals.user || !res.locals.user.isAdmin) {
      throw new UnauthorizedError();
    }
    next();
  } catch (err) {
    next(err);
  }
}

/** Middleware to use when they must be logged in, and either an admin, or the requesting user.
 * 
 * If not, raises Unauthorized.
 */
function ensureAdminOrUser(req, res, next) {
  try {
    if (!res.locals.user || ((req.params.username !== res.locals.user.username) && !res.locals.user.isAdmin)) {
      throw new UnauthorizedError();
    }
    next();
  } catch (err) {
    next(err);
  }
}



module.exports = {
  authenticateJWT,
  ensureLoggedIn,
  ensureAdmin,
  ensureAdminOrUser,
};
