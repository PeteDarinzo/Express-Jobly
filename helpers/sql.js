const { BadRequestError } = require("../expressError");


/** Turn an object of user data to be updated into a SQL query
 * e.g. {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
 * 
 * Object keys are names of columns to be updated
 * jsToSql parameter is a "dictionary" that relates user parameters to column names (first name, last name, and admin)
 *  
 * Construct query by taking all keys (column names) and setting them equal to their index, plus one, to account for zero indexing
 * 
 * Each column is then joined into a string to make the query
 * The updated values are stored in their own array
 * 
 * Together they are used to make the complete query
 * 
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


/** Turn an object containing up to three filters (minEmployees, maxEmployees, name) into an SQL WHERE statement
 * 
 * Each combination of filters is checked, so that the query can consist of any and all filters
 */
function sqlForCompanyFilters(filters) {
  let outputStatement = "";
  let minEmployees;
  let maxEmployees;
  if (filters.minEmployees) { minEmployees = filters.minEmployees };
  if (filters.maxEmployees) { maxEmployees = filters.maxEmployees };
  let name = filters.name || "";
  name = name.toLowerCase();

  let bits = [];

  if (minEmployees) {
    bits.push(`num_employees >= ${minEmployees}`);
  }

  if (maxEmployees) {
    bits.push(`num_employees <= ${maxEmployees}`);
  }

  if (name) {
    bits.push(`LOWER(name) LIKE '%${name}%'`);
  }

  if (bits.length) {
    outputStatement = "WHERE " + bits.join(' AND ');
  }

  return outputStatement;
}


/** Turn an object containing up to three filters (title, minSalary, hasEquity) into an SQL WHERE statement
 * 
 * Each combination of filters is checked, so that the query can consist of any and all filters
 */

function sqlForJobFilters(filters) {
  let outputStatement = "";
  let minSalary;
  let hasEquity = false;
  if (filters.minSalary) { minSalary = filters.minSalary };
  if (filters.hasEquity) { hasEquity = true };
  let title = filters.title || "";
  title = title.toLowerCase();

  let bits = [];

  if (minSalary) {
    bits.push(`salary >= ${minSalary}`);
  }

  if (hasEquity) {
    bits.push('equity > 0');
  }

  if (title) {
    bits.push(`LOWER(title) LIKE '%${title}%'`);
  }

  if (bits.length) {
    outputStatement = "WHERE " + bits.join(' AND ');
  }

  return outputStatement;
}

module.exports = { sqlForPartialUpdate, sqlForCompanyFilters, sqlForJobFilters };
