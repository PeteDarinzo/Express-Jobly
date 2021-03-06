"use strict"

/** Routes for jobs. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");

const { ensureAdmin } = require("../middleware/auth");

const jobNewSchema = require("../schemas/jobNew.json");
const jobUpdateSchema = require("../schemas/jobUpdate.json");
const Job = require("../models/job");


// @ts-ignore
const router = new express.Router();


/** POST / { job } => { job }
 * 
 * job should be { title, salary, equity, company_handle }
 * 
 * Returns { title, salary, equity, company_handle }
 * 
 * Authorization required: admin
 * 
 */

router.post("/", ensureAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, jobNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }
    const job = await Job.create(req.body);
    res.status(201).json({ job });
  } catch (err) {
    next(err);
  }
});


/** GET /  =>
 *   { jobs: [ { title, salary, equity, companyHandle }, ...] }
 * *
 * Authorization required: none
 */

router.get("/", async function (req, res, next) {
  try {
    const jobs = await Job.findAll(req.query);
    res.json({ jobs })
  } catch (err) {
    next(err);
  }
});


/** GET /[title]  =>  { job }
 *
 *  Job is { title, salary, equity, companyHandle }
 *   where jobs is [{ title, salary, equity, companyHandle }, ...]
 *
 * Authorization required: none
 */

router.get("/:title", async function (req, res, next) {
  try {
    const job = await Job.get(req.params.title);
    res.json({ job });
  } catch (err) {
    next(err);
  }
});


/** PATCH /[title] { fld1, fld2, ... } => { job }
 *
 * Patches job data.
 *
 * fields can be: { salary, equity }
 *
 * Returns { title, salary, equity, companyHandle }
 *
 * Authorization required: admin
 */

router.patch("/:title", ensureAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, jobUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const job = await Job.update(req.params.title, req.body);
    res.json({ job });
  } catch (err) {
    next(err);
  }
});


/** DELETE /[title]  =>  { deleted: title }
 *
 * Authorization: admin
 */

router.delete("/:title", ensureAdmin, async function (req, res, next) {
  try {
    await Job.remove(req.params.title);
    res.json({ deleted: req.params.title });
  } catch (err) {
    next(err);
  }
});


module.exports = router;