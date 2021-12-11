
const { sqlForPartialUpdate, sqlForFilters } = require("./sql");

let dataToUpdate = { firstName: 'newFirst', lastName: 'newLast', age: 32 };

const jsToSql = {
    firstName: "first_name",
    lastName: "last_name",
    isAdmin: "is_admin",
};



describe("sqlForPartialUpdate", function () {
    test("works", function () {
        const { setCols, values } = sqlForPartialUpdate(dataToUpdate, jsToSql);
        expect(setCols).toEqual('"first_name"=$1, "last_name"=$2, "age"=$3');
        expect(values).toEqual(['newFirst', 'newLast', 32]);
    });
});



describe("sqlForFilters", function () {
    test("works minEmployees", function () {
        let filter = { minEmployees: "10" };
        let statement = sqlForFilters(filter);
        expect(statement).toEqual("WHERE num_employees >= 10");
    });

    test("works maxEmployees", function () {
        let filter = { maxEmployees: "10" };
        let statement = sqlForFilters(filter);
        expect(statement).toEqual("WHERE num_employees <= 10");
    });

    test("works minEmployees and maxEmployees", function () {
        let filter = { minEmployees: "5", maxEmployees: "10" }
        let statement = sqlForFilters(filter);
        expect(statement).toEqual("WHERE num_employees >= 5 AND num_employees <= 10");
    });

    test("works name", function () {
        let filter = { name: "net" }
        let statement = sqlForFilters(filter);
        expect(statement).toEqual(`WHERE LOWER(name) LIKE '%net%'`)
    });

    test("works min, name", function () {
        let filters = {minEmployees: "5", name: "net"};
        let statement = sqlForFilters(filters);
        expect(statement).toEqual(`WHERE LOWER(name) LIKE '%net%' AND num_employees >= 5`);
    });

    test("works max, name", function () {
        let filters = {maxEmployees: "10", name: "net"};
        let statement = sqlForFilters(filters);
        expect(statement).toEqual(`WHERE LOWER(name) LIKE '%net%' AND num_employees <= 10`);
    });

    test("works min, max, name", function () {
        let filters = {minEmployees: "5", maxEmployees: "10", name: "net"};
        let statement = sqlForFilters(filters);
        expect(statement).toEqual(`WHERE LOWER(name) LIKE '%net%' AND num_employees >= 5 AND num_employees <= 10`);
    });
});