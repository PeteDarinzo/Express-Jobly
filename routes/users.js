"use strict";

/** Routes for users. */

const jsonschema = require("jsonschema");

const express = require("express");
const { ensureLoggedIn, ensureAdmin, ensureAdminOrUser } = require("../middleware/auth");
const { BadRequestError } = require("../expressError");
const User = require("../models/user");
const { createToken } = require("../helpers/tokens");
const userNewSchema = require("../schemas/userNew.json");
const userUpdateSchema = require("../schemas/userUpdate.json");
const generator = require("generate-password");

const router = express.Router();


/** POST / { user }  => { user, token }
 *
 * Adds a new user. This is not the registration endpoint --- instead, this is
 * only for admin users to add new users. The new user being added can be an
 * admin.
 * 
 * A randomly generated password is assigned to the new user.
 *
 * This returns the newly created user and an authentication token for them:
 *  {user: { username, firstName, lastName, email, isAdmin }, token }
 *
 * Authorization required: login
 **/

router.post("/", ensureAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, userNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }
    const { username, firstName, lastName, email, isAdmin } = req.body;
    const password = generator.generate({
      length: 10,
      numbers: true
    });
    const user = await User.register({ username, firstName, lastName, password, email, isAdmin });
    const token = createToken(user);
    res.status(201).json({ user, token });
  } catch (err) {
    next(err);
  }
});

router.post("/:username/jobs/:id", ensureAdminOrUser, async function (req, res, next) {
  try {
    const applicationStates = ["interested", "applied", "rejected", "accepted"];
    const { state } = req.query;
    if (!((applicationStates.indexOf(state)) >= 0)) {
      throw new BadRequestError(`Application state not allowed: ${state}`);
    }
    const { username, id } = req.params;
    const jobId = await User.applyToJob(username, id, state);
    res.json({ applied: jobId.jobId })
  } catch (err) {
    next(err);
  }
});


/** GET / => { users: [ {username, firstName, lastName, email }, ... ] }
 *
 * Returns list of all users.
 *
 * Authorization required: login
 **/

router.get("/", ensureAdmin, async function (req, res, next) {
  try {
    const users = await User.findAll();
    res.json({ users });
  } catch (err) {
    next(err);
  }
});


/** GET /[username] => { user }
 *
 * Returns { username, firstName, lastName, isAdmin }
 *
 * Authorization required: login
 **/

router.get("/:username", ensureAdminOrUser, async function (req, res, next) {
  try {
    const user = await User.get(req.params.username);
    res.json({ user });
  } catch (err) {
    next(err);
  }
});


/** PATCH /[username] { user } => { user }
 *
 * Data can include:
 *   { firstName, lastName, password, email }
 *
 * Returns { username, firstName, lastName, email, isAdmin }
 *
 * Authorization required: login
 **/

router.patch("/:username", ensureAdminOrUser, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, userUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const user = await User.update(req.params.username, req.body);
    res.json({ user });
  } catch (err) {
    next(err);
  }
});


/** DELETE /[username]  =>  { deleted: username }
 *
 * Authorization required: login
 **/

router.delete("/:username", ensureAdminOrUser, async function (req, res, next) {
  try {
    await User.remove(req.params.username);
    res.json({ deleted: req.params.username });
  } catch (err) {
    next(err);
  }
});


module.exports = router;
