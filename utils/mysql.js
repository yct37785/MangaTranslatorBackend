import mysql from 'mysql';
var env = process.env.NODE_ENV || 'development';

/* development */
const dbSocketPath = process.env.DB_SOCKET_PATH || '/cloudsql';
var db = env === 'development' ? mysql.createPool({
  host: process.env.sql_host,
  connectionLimit: 50,
  user: process.env.sql_user,
  password: process.env.sql_password,
  database: process.env.sql_schema,
  multipleStatements: true
}) : mysql.createPool({
  user: process.env.sql_user, // e.g. 'my-db-user'
  password: process.env.sql_password, // e.g. 'my-db-password'
  database: process.env.sql_schema, // e.g. 'my-database'
  // If connecting via unix domain socket, specify the path
  socketPath: `${dbSocketPath}/${process.env.CLOUD_SQL_CONNECTION_NAME}`,
  connectionLimit: 50,
  multipleStatements: true
});

/* helper to make simple query */
export const makeSimpleQuery = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.query(query, params, (error, results, fields) => {
      if (error) {
        console.log('SQL query error: ' + JSON.stringify(error));
        reject(error);
      } else {
        resolve(results, fields);
      }
    });
  });
}