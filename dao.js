const os      = require('os');
const path    = require('path');
const sqlite3 = require('sqlite3');
//const config  = require('../config.json');

const dbfile    = 'Documents/db/Models_R_US.db';
const dbpath  = path.join(os.homedir(), ...dbfile.split('/'));
const db      = new (sqlite3.verbose()).Database(dbpath);

const GET_ALL_PRODUCTS = 'SELECT P.*, C.name as category, V.name as vendor '
                       + 'FROM Product P, Category C, Vendor V '
                       + 'WHERE P.catid = C.id AND P.venid = V.id';

const conditions = {
  "id":          " AND P.id = ?",
  "name":        " AND UPPER(P.name) LIKE UPPER(?)",         // case insensitive
  "description": " AND UPPER(P.description) LIKE UPPER(?)",  // case insensitive
  "category":    " AND C.name = ?",
  "vendor":      " AND V.name = ?",
  "min_cost":    " AND P.cost >= ?",
  "min_msrp":    " AND P.msrp >= ?",
  "min_qty":     " AND P.qty  >= ?",
  "max_cost":    " AND P.cost <= ?",
  "max_msrp":    " AND P.msrp <= ?",
  "max_qty":     " AND P.qty  <= ?",
  "catId":       " AND P.catid = ?"
};

module.exports = {
  /**
   * Retrieves an array of Products that match the given query parameters. If
   * the array is retrieved successfully, pass them as arguments to the success
   * callback, otherwise pass the error to the failure callback. If no Products
   * are found, the array is empty.
   *
   * @param {{[string]: string}} query
   * @param {(rows: any[]) => void} success 
   * @param {(err: Error | string) => void} failure 
   */
  getProducts(query, success, failure = console.log) {
    let statement = [GET_ALL_PRODUCTS];
    let values    = [];
    console.log('query ')
    console.log(query);
    Object.keys(query).map(k => [k, query[k]]).forEach(([k, v]) => {
      let condition = conditions[k];
      if (condition) {
        statement.push(condition);
        values.push(condition.match(/LIKE/) ? `%${v}%` : v);
      }
    });

    console.log(statement);
    console.log(values);
    db.all(statement.join(""), values, (err, rows) => {
      if (err == null) {
        success(rows);
      } else {
        failure(err);
      }
    });
  }
};