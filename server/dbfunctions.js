const db = require('./dbconnect.js');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const HashIt = async (password) => {
    const hashed = await bcrypt.hash(password);
    return hashed;
}

const compareIt = async (password,hashedPassword) => {
    const bool = await bcrypt.compare(password,hashedPassword);
    return bool;
}

const otpGenerate = async (digit = 6) => {
    const otp = crypto.randomBytes(digit,(error,buffer)=>{
        if(error)
        {
            return "1234";
        }
        return buffer.toString(hex);
    });
    return otp;
}

const DateTime = (addyears=0,addmonths=0,adddays=0,addhours=0,addminuts=0,addseconds=0) => {

    let date_ob = new Date();

    // current date
    // adjust 0 before single digit date
    let date = ("0" + date_ob.getDate()+adddays).slice(-2);

    // current month
    let month = ("0" + (date_ob.getMonth() + 1 + addmonths)).slice(-2);

    // current year
    let year = date_ob.getFullYear()+addyears;

    // current hours
    let hours = date_ob.getHours() + addhours;

    // current minutes
    let minutes = date_ob.getMinutes() + addminuts;

    // current seconds
    let seconds = date_ob.getSeconds() + addseconds;

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
    db.query(query, (error,result) => {
        if(error){ 
            throw error;
        }else{
           return result; 
        }
    });
};

const InsertDataInTable = async (table_name,column_names,column_values) => {
    const query = "insert into "+table_name+" ("+column_names+") values ("+column_values+")";
    
    return db.query(query, (error,result) => {
        if(error){
            throw error;
        }
        else
        {
            return result;
        }
    });
};

const AnyDbQuery = async (AnyQuery) => {
    return db.query(AnyQuery, (error,result) => {
        if(error){ 
            throw error;
        }
        else
        {            
            return result;
        }
    });
};

const LogEmail = async (to,from,subject,content,content_type,status) => {
    return InsertDataInTable("email_history","id,email_to,email_from,subject,content,content_type,status,updated_datetime,create_datetime","'','"+to+"','"+from+"','"+subject+"','"+content+"','"+content_type+"','"+status+"','"+DateTime()+"','"+DateTime()+"'");
};

const Register = async (email,username,password) => {
    password = HashIt(password);
    const vkey = HashIt(password+email);
    const accesskey = HashIt(password+email+username+DateTime());
    const otp = otpGenerate();
    const usertype = "student";
    const priority = "owner";
    // first check if user is already registered or not
    var result = await AnyDbQuery("select username from accounts where email='"+email+"'");
    
    if(row = JSON.parse(JSON.stringify(result[0])))
    {
        return 0;   //already registered
    }
    else
    {
        result = await InsertDataInTable("accounts","id,profile_photo,username,email,password,vkey,access_key,otp,user_type,priority,descrition,otp_expiry,updated_datetime,created_datetime","'','','"+username+"','"+email+"','"+password+"','"+vkey+"','"+accesskey+"','"+otp+"','"+usertype+"','"+priority+"','','"+DateTime()+"','"+DateTime()+"','"+DateTime()+"'");
        if(JSON.parse(JSON.stringify(result[0])).affectedRows)
        {
            return 1;   //registered
        }
        else
        {
            return 2;   //unable to register
        }
    }
    
    
}

module.exports = {DateTime,UpdateTable,InsertDataInTable,AnyDbQuery,LogEmail,Register,compareIt,HashIt,otpGenerate};

