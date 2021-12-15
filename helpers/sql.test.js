
const { sqlForPartialUpdate, sqlForCompanyFilters, sqlForJobFilters } = require("./sql");

let dataToUpdate = { firstName: 'newFirst', lastName: 'newLast', age: 32 };

const jsToSql = {
    firstName: "first_name",
    lastName: "last_name",
    isAdmin: "is_admin",
};


/************************************** update */

describe("sqlForPartialUpdate", function () {
    test("works", function () {
        const { setCols, values } = sqlForPartialUpdate(dataToUpdate, jsToSql);
        expect(setCols).toEqual('"first_name"=$1, "last_name"=$2, "age"=$3');
        expect(values).toEqual(['newFirst', 'newLast', 32]);
    });
});

/************************************** filter companies */

describe("sqlForCompanyFilters", function () {
    test("works minEmployees", function () {
        let filter = { minEmployees: "10" };
        let statement = sqlForCompanyFilters(filter);
        expect(statement).toEqual("WHERE num_employees >= 10");
    });

    test("works maxEmployees", function () {
        let filter = { maxEmployees: "10" };
        let statement = sqlForCompanyFilters(filter);
        expect(statement).toEqual("WHERE num_employees <= 10");
    });

    test("works minEmployees and maxEmployees", function () {
        let filter = { minEmployees: "5", maxEmployees: "10" }
        let statement = sqlForCompanyFilters(filter);
        expect(statement).toEqual("WHERE num_employees >= 5 AND num_employees <= 10");
    });

    test("works name", function () {
        let filter = { name: "net" }
        let statement = sqlForCompanyFilters(filter);
        expect(statement).toEqual(`WHERE LOWER(name) LIKE '%net%'`)
    });

    test("works min, name", function () {
        let filters = { minEmployees: "5", name: "net" };
        let statement = sqlForCompanyFilters(filters);
        expect(statement).toEqual(`WHERE LOWER(name) LIKE '%net%' AND num_employees >= 5`);
    });

    test("works max, name", function () {
        let filters = { maxEmployees: "10", name: "net" };
        let statement = sqlForCompanyFilters(filters);
        expect(statement).toEqual(`WHERE LOWER(name) LIKE '%net%' AND num_employees <= 10`);
    });

    test("works min, max, name", function () {
        let filters = { minEmployees: "5", maxEmployees: "10", name: "net" };
        let statement = sqlForCompanyFilters(filters);
        expect(statement).toEqual(`WHERE LOWER(name) LIKE '%net%' AND num_employees >= 5 AND num_employees <= 10`);
    });
});

/************************************** filter jobs */

describe("sqlForJobFilters", function () {
    test("works minSalary", function () {
        let filter = { minSalary: "50000" };
        let statement = sqlForJobFilters(filter);
        expect(statement).toEqual("WHERE salary >= 50000");
    });

    test("works hasEquity", function () {
        let filter = { hasEquity: true };
        let statement = sqlForJobFilters(filter);
        expect(statement).toEqual("WHERE equity > 0");
    });

    test("works minSalary and hasEquity", function () {
        let filter = { minSalary: "50000", hasEquity: true }
        let statement = sqlForJobFilters(filter);
        expect(statement).toEqual("WHERE salary >= 50000 AND equity > 0");
    });

    test("works title", function () {
        let filter = { title: "programmer" }
        let statement = sqlForJobFilters(filter);
        expect(statement).toEqual(`WHERE LOWER(title) LIKE '%programmer%'`)
    });

    test("works minSalary, title", function () {
        let filters = { minSalary: "50000", title: "programmer" };
        let statement = sqlForJobFilters(filters);
        expect(statement).toEqual(`WHERE LOWER(title) LIKE '%programmer%' AND salary >= 50000`);
    });

    test("works equity, name", function () {
        let filters = { hasEquity: true, title: "programmer" };
        let statement = sqlForJobFilters(filters);
        expect(statement).toEqual(`WHERE LOWER(title) LIKE '%programmer%' AND equity > 0`);
    });

    test("works minSalary, hasEquity, title", function () {
        let filters = { minSalary: "50000", hasEquity: true, title: "programmer" };
        let statement = sqlForJobFilters(filters);
        expect(statement).toEqual(`WHERE LOWER(title) LIKE '%programmer%' AND salary >= 50000 AND equity > 0`);
    });
});