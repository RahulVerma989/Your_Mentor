const fs = require('fs');
const mysql = require("mysql");
require('dotenv').config({ path: '../../private/config.env'});

var db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    multipleStatements: true
});
//check if mysql server is running or not
db.connect((error) => {
    if(error)
    {
        console.log(error);
    }
    else{
        console.log("MySQL server is active!");
        console.log("Checking database...");

        //try to create the database if doesnot exists
        const sql = "CREATE DATABASE IF NOT EXISTS "+process.env.DATABASE_NAME
        db.query(sql, (error,rows)=>{
            if(error){
        
                //database may exists
                console.log('Database '+process.env.DATABASE_NAME+' may exists!\n');
                console.log('Error: '+error);
                CheckTables();
            }
            if(rows){
            
            console.log("Database Created!\n");            
            // console.log(rows);
            CheckTables();
            db.end((error)=>{
                if(error)
                {                
                    console.log(error);
                }
            });

            }
        });
    }
});

const CheckTables = async () => {
    var db = mysql.createConnection({
        host: process.env.DATABASE_HOST,
        user: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME,
        multipleStatements: true
    });
    //create tables if not exists
    const sqlString = fs.readFileSync('../private/dbtables.sql').toString();
    const sqlArray = sqlString.split(');');
    
    for(var i = 0; i < sqlArray.length-1; i++)
    {
        var query = sqlArray[i]+');';
        db.query(query, (error,rows) => {
            if(error){
                console.log(error);
            }
            else
            {
                console.log(rows);
            }
        });
    }
}
