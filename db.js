var mysql = require('mysql');

var conn = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database : 'startwelldb',
    dateStrings:true,
    insecureAuth : true
  });
  



module.exports = {
    conn
}
    