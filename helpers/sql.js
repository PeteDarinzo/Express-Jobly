const { BadRequestError } = require("../expressError");


/** Turn and object of user data to update into a SQL query
 * e.g. {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
 * 
 * Object keys are names of columns to be updated
 * jsToSql parameter is a "dictionary" that relates user paraments to column names (first name, last name, and admin)
 *  
 * Construct query by taking all keys (column names) and setting them equal to their index plus one, to account for zero indexing
 * 
 * Each column is then joined into a string
 * The values are stored in their own array
 */
function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);

  // throw error if no data present
  if (keys.length === 0) throw new BadRequestError("No data");

  // replace firstName with first_name (also for lastName and isAdmin), otherwise use the provided key
  const cols = keys.map((colName, idx) =>
    `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate)
  };
}


// Turn an object containing up to three filters (minEmployees, maxEmployees, name) into an SQL WHERE statement
function sqlForFilters(filters) {
  let outputStatement = "";
  let minEmployees;
  let maxEmployees;
  if (filters.minEmployees) { minEmployees = filters.minEmployees };
  // const minEmployees = filters.minEmployees;
  if (filters.maxEmployees) { maxEmployees = filters.maxEmployees };
  // const maxEmployees = filters.maxEmployees;
  let name = filters.name || "";
  name = name.toLowerCase();

  if (minEmployees) {
    outputStatement = `WHERE num_employees >= ${minEmployees}`;
  }

  if (maxEmployees) {
    outputStatement = `WHERE num_employees <= ${maxEmployees}`;
  }

  if (minEmployees && maxEmployees) {
    outputStatement = `WHERE num_employees >= ${minEmployees} AND num_employees <= ${maxEmployees}`;
  }

  if (name) {
    outputStatement = `WHERE LOWER(name) LIKE '%${name}%'`;
  }

  if (minEmployees && name) {
    outputStatement = `WHERE LOWER(name) LIKE '%${name}%' AND num_employees >= ${minEmployees}`;
  }

  if (maxEmployees && name) {
    outputStatement = `WHERE LOWER(name) LIKE '%${name}%' AND num_employees <= ${maxEmployees}`;
  }

  if (minEmployees && maxEmployees && name) {
    outputStatement = `WHERE LOWER(name) LIKE '%${name}%' AND num_employees >= ${minEmployees} AND num_employees <= ${maxEmployees}`;
  }

  return outputStatement;
}

module.exports = { sqlForPartialUpdate, sqlForFilters };
