const db = require('./dbconnect.js');

const DateTime = () => {

    let date_ob = new Date();

    // current date
    // adjust 0 before single digit date
    let date = ("0" + date_ob.getDate()).slice(-2);

    // current month
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);

    // current year
    let year = date_ob.getFullYear();

    // current hours
    let hours = date_ob.getHours();

    // current minutes
    let minutes = date_ob.getMinutes();

    // current seconds
    let seconds = date_ob.getSeconds();

    return year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds;
};

const UpdateTable = async (table_name,key_value_pairs_in_json,target_row_query) => {
    var obj = JSON.parse(key_value_pairs_in_json);
    var keys = Object.keys(obj);
    var update = "";
    for(var i =0; i < keys.length; i++){
        if(i > 1) update += ", ";
        update += keys[i]+' = '+obj[keys[i]];
    }
    
        var query = "update "+table_name+" set "+update+" where "+target_row_query;
    db.query(query, (error) => {
        if(error) throw error;
    });
};

const InsertDataInTable = async (table_name,column_names,column_values) => {
    const query = "insert into "+table_name+" ("+column_names+") values ("+column_values+")";
    
    db.query(query, (error) => {
        if(error) throw error;
    });
};

const AnyDbQuery = async (AnyQuery) => {
    db.query(AnyQuery, (error) => {
        if(error) throw error;
    });
};

const LogEmail = async (to,from,subject,content,content_type,status) => {
    InsertDataInTable("email_history","id,email_to,email_from,subject,content,content_type,status,updated_datetime,create_datetime","'','"+to+"','"+from+"','"+subject+"','"+content+"','"+content_type+"','"+status+"','"+DateTime()+"','"+DateTime()+"'");
};

module.exports = {DateTime,UpdateTable,InsertDataInTable,AnyDbQuery,LogEmail};

