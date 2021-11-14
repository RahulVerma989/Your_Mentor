const mysql = require("mysql");
require('dotenv').config({ path: '../private/config.env'});
const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    multipleStatements: true
});
db.connect((error) => {
    if(error)
    {
        throw error;
    }
    else{
        console.log("MySQL Database Connected!");
    }
});

module.exports = db;