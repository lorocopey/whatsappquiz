require('dotenv');
const mysql = require('mysql');

var pool  = mysql.createPool({
    connectionLimit : 10,
    host            : process.env.host,
    user            : process.env.user,
    password        : process.env.password,
    database        : process.env.database
});

pool.getConnection(function(err, connection) {
    if (err) throw err; // not connected!
    console.log('Database Connected!')
    // Use the connection
    //connection.query('SELECT something FROM sometable', function (error, results, fields) {
      // When done with the connection, release it.
      //connection.release();
   
      // Handle error after the release.
      //if (error) throw error;
   
      // Don't use the connection here, it has been returned to the pool.
    //});
  });

module.exports = pool;