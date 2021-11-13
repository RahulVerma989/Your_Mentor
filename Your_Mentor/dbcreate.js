const mysql = require("mysql");
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
        console.log("Checking database...");

        //try to create the database if doesnot exists
        sql = "CREATE DATABASE IF NOT EXISTS "+process.env.DATABASE_NAME
        db.query(sql, (error,rows)=>{
            if(error){
        
                //database may exists
                console.log('Database '+process.env.DATABASE_NAME+' may exists!\n');
                console.log('Error: '+error);
            }
            if(rows){
                console.log("Database Created!\n");
                console.log(rows);

                //create tables if not exists

            }
        });
    }
});

db.end((error)=>{
    console.log(error);
});