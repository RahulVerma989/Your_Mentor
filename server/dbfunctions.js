const db = require('./dbconnect.js');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const HashIt = async (password,saltRounds = 10) => {
    const hashed = await bcrypt.hash(password,saltRounds);
    return hashed;
}

const compareIt = async (password,hashedPassword) => {
    const bool = await bcrypt.compare(password,hashedPassword);
    return bool;
}

const otpGenerate = async (bytes = 3) => {
    return crypto.randomBytes(bytes).toString('hex');
}

const DateTime = async (addyears=0,addmonths=0,adddays=0,addhours=0,addminuts=0,addseconds=0) => {

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

const UpdateTable = async (table_name,key_value_pairs_in_json,target_row_query, callback) => {
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
            callback(error,null);
        }else{
           callback(null,result); 
        }
    });
};

const InsertDataInTable = async (table_name,column_names,column_values, callback) => {
    const query = "insert into "+table_name+" ("+column_names+") values ("+column_values+")";
    
    db.query(query, (error,result) => {
        if(error){
            callback(error,null);
        }
        else
        {
            callback(null,result);
        }
    });
};

function AnyDbQuery(AnyQuery,callback){
    db.query(AnyQuery, (error,result) => {
        if(error){ 
            callback(err,null);
        }
        else
        {            
            callback(null,result);
        }
    });
};

const LogEmail = async (to,from,subject,content,content_type,status, callback) => {
    InsertDataInTable("email_history","id,email_to,email_from,subject,content,content_type,status,updated_datetime,create_datetime","'','"+to+"','"+from+"','"+subject+"','"+content+"','"+content_type+"','"+status+"','"+DateTime()+"','"+DateTime()+"'", (error,result)=>{
        if(error)
        {
            callback(error,null);
        }
        else
        {
            callback(null,result);
        }
    });
};

const Register = async (email,username,password, callback) => {
    password = await HashIt(password,10);
    const vkey = await HashIt(password+email,10);
    const accesskey = await HashIt(password+email+username+DateTime(),10);
    const otp = await otpGenerate(3);
    const usertype = "student";
    const priority = "owner";
    const datetime = await DateTime(0,0,0,0,0,0);
    const otpexpiry = await DateTime(0,0,0,0,15,0);
    // first check if user is already registered or not
    AnyDbQuery("select username from accounts where email='"+email+"'",(error,result)=>{
        // console.log(result['_fields'].length);
        if(error)
        {
            callback(error,null);  
        }
        else
        {
            console.log(result);
            if(result.length)
            {
                callback(null,0); //already registered
            }
            else
            {
                InsertDataInTable("accounts","id,profile_photo,username,email,password,vkey,access_key,otp,user_type,priority,description,otp_expiry,updated_datetime,created_datetime","'','default.png','"+username+"','"+email+"','"+password+"','"+vkey+"','"+accesskey+"','"+otp+"','"+usertype+"','"+priority+"','','"+otpexpiry+"','"+datetime+"','"+datetime+"'",(error,result)=>{
                    // console.log(result['_index'] >= 0);
                    if(error)
                    {
                        callback(error,null);
                    }
                    else
                    {
                        // console.log(result);
                        if(result.affectedRows)
                        {
                            callback(null,1);   //registered
                        }
                        else
                        {
                            callback(null,2);   //unable to register
                        }
                    }                    
                });
            }
        }
    });   
    
}

module.exports = {DateTime,UpdateTable,InsertDataInTable,AnyDbQuery,LogEmail,Register,compareIt,HashIt,otpGenerate};

