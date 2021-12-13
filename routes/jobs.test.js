"use strict"

const request = require("supertest");

const db = require("../db");
const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  a1Token
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

// /************************************** POST /jobs  */

describe("POST /jobs", function () {
  const newJob = {
    title: "new",
    salary: 50000,
    equity: "0",
    companyHandle: "c1"
  };

  test("ok for admins", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send(newJob)
      .set("authorization", `Bearer ${a1Token}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      job: {
        id: expect.any(Number),
        title: "new",
        salary: 50000,
        equity: "0",
        companyHandle: "c1"
      },
    });
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send({
        title: "new",
        salary: 50000,
        equity: "0",
        handle: "c1"
      });
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for non admin", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send(newJob)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("bad request with missing data", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send({
        title: "new",
        salary: 60000
      })
      .set("authorization", `Bearer ${a1Token}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with invalid data", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send({
        ...newJob,
        salary: "70000"
      })
      .set("authorization", `Bearer ${a1Token}`);
    expect(resp.statusCode).toEqual(400);
  });
});


/************************************** GET /jobs */

describe("GET /jobs", function () {
  test("ok for anon", async function () {
    const resp = await request(app).get("/jobs");
    expect(resp.body).toEqual({
      jobs:
        [
          {
            title: "J1",
            salary: 50000,
            equity: "0",
            companyHandle: "c1"
          },
          {
            title: "J2",
            salary: 60000,
            equity: "0",
            companyHandle: "c2"
          },
          {
            title: "J3",
            salary: 70000,
            equity: "0",
            companyHandle: "c3"
          },
          {
            title: "J4",
            salary: 80000,
            equity: "0.5",
            companyHandle: "c1"
          }
        ]
    });
  });

  test("fails: test next() handler", async function () {
    // there's no normal failure event which will cause this route to fail ---
    // thus making it hard to test that the error-handler works with it. This
    // should cause an error, all right :)
    await db.query("DROP TABLE jobs CASCADE");
    const resp = await request(app)
      .get("/jobs")
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(500);
  });


  test("works: filter: minSalary", async function () {
    let filter = { minSalary: "60000" };
    const resp = await request(app)
      .get("/jobs")
      .query(filter);

    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({
      jobs: [
        {
          title: "J2",
          salary: 60000,
          equity: "0",
          companyHandle: "c2"
        },
        {
          title: "J3",
          salary: 70000,
          equity: "0",
          companyHandle: "c3"
        },
        {
          title: "J4",
          salary: 80000,
          equity: "0.5",
          companyHandle: "c1"
        }
      ]
    });
  });

  test("works: filter: hasEquity", async function () {
    let filter = { hasEquity: true };
    const resp = await request(app)
      .get("/jobs")
      .query(filter);
    expect(resp.statusCode).toBe(200);
    expect(resp.body).toEqual({
      jobs: [
        {
          title: "J4",
          salary: 80000,
          equity: "0.5",
          companyHandle: "c1"
        }
      ]
    });
  });

  test("works: filters: minSalary, hasEquity", async function () {
    let filters = { minSalary: 60000, hasEquity: true };
    const resp = await request(app)
      .get("/jobs")
      .query(filters);

    expect(resp.statusCode).toBe(200);
    expect(resp.body).toEqual({
      jobs: [
        {
          title: "J4",
          salary: 80000,
          equity: "0.5",
          companyHandle: "c1"
        }
      ]
    });
  });

  test("works: filters: minSalary, title", async function () {
    let filters = { minSalary: 60000, title: "3" };
    const resp = await request(app)
      .get("/jobs")
      .query(filters);
    expect(resp.statusCode).toBe(200);
    expect(resp.body).toEqual({
      jobs: [
        {
          title: "J3",
          salary: 70000,
          equity: "0",
          companyHandle: "c3"
        }
      ]
    });
  });

  test("works: filter: hasEquity, title", async function () {
    let filters = { hasEquity: true, title: "4" };
    const resp = await request(app)
      .get("/jobs")
      .query(filters);
    expect(resp.statusCode).toBe(200);
    expect(resp.body).toEqual({
      jobs: [
        {
          title: "J4",
          salary: 80000,
          equity: "0.5",
          companyHandle: "c1"
        }
      ]
    });
  });

  test("works: filter: minSalary, hasEquity, title", async function () {
    let filters = { minSalary: "50000", hasEquity: true, title: "4" };
    const resp = await request(app)
      .get("/jobs")
      .query(filters);
    expect(resp.statusCode).toBe(200);
    expect(resp.body).toEqual({
      jobs: [
        {
          title: "J4",
          salary: 80000,
          equity: "0.5",
          companyHandle: "c1"
        }
      ]
    });
  });

});

/************************************** GET /jobs/:title */

describe("GET /jobs/:title", function () {
  test("works for anon", async function () {
    const resp = await request(app).get(`/jobs/J1`);
    expect(resp.body).toEqual({
      job: {
        title: "J1",
        salary: 50000,
        equity: "0",
        companyHandle: "c1"
      }
    });
  });


  test("not found for no such company", async function () {
    const resp = await request(app).get(`/jobs/nope`);
    expect(resp.statusCode).toEqual(404);
  });
});

// /************************************** PATCH /jobs/:handle */

describe("PATCH /jobs/:title", function () {
  test("works for admins", async function () {
    const resp = await request(app)
      .patch(`/jobs/J1`)
      .send({
        salary: 111000,
      })
      .set("authorization", `Bearer ${a1Token}`);
    expect(resp.body).toEqual({
      job: {
        title: "J1",
        salary: 111000,
        equity: "0",
        companyHandle: "c1"
      }
    });
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
      .patch(`/jobs/J1`)
      .send({
        name: "J1-new",
      });
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for non admin", async function () {
    const resp = await request(app)
      .patch(`/jobs/J1`)
      .send({
        name: "J1-new",
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found on no such job", async function () {
    const resp = await request(app)
      .patch(`/jobs/nope`)
      .send({
        salary: 111000,
      })
      .set("authorization", `Bearer ${a1Token}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("bad request on handle change attempt", async function () {
    const resp = await request(app)
      .patch(`/jobs/J1`)
      .send({
        handle: "c1-new",
      })
      .set("authorization", `Bearer ${a1Token}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request on invalid data", async function () {
    const resp = await request(app)
      .patch(`/jobs/J1`)
      .send({
        salary: "not-an-integer",
      })
      .set("authorization", `Bearer ${a1Token}`);
    expect(resp.statusCode).toEqual(400);
  });
});



/************************************** DELETE /companies/:handle */

describe("DELETE /jobs/:title", function () {
  test("works for admins", async function () {
    const resp = await request(app)
      .delete(`/jobs/J1`)
      .set("authorization", `Bearer ${a1Token}`);
    expect(resp.body).toEqual({ deleted: "J1" });
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
      .delete(`/jobs/J1`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for non admin", async function () {
    const resp = await request(app)
      .delete(`/jobs/J1/`)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found for no such company", async function () {
    const resp = await request(app)
      .delete(`/jobs/nope`)
      .set("authorization", `Bearer ${a1Token}`);
    expect(resp.statusCode).toEqual(404);
  });
});


