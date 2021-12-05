const db = require('./dbconnect.js');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const moment = require('moment');

const HashIt = async (password,saltRounds = 10) => {
    const hashed = await bcrypt.hash(password,saltRounds);
    return hashed;
}

const compareIt = async (password,hashedPassword,callback) => {
    bcrypt.compare(password,hashedPassword,(error,result)=>{
        if(error)
        {
            callback(error,null);
        }    
        else
        {
            callback(null,result);
        }
    });
}

function otpGenerate(bytes = 3){
    return crypto.randomBytes(bytes).toString('hex');
}

function DateTime(addyears=0,addmonths=0,adddays=0,addhours=0,addminutes=0,addseconds=0){

    // let date_ob = new Date();
    var date =  moment().format('YYYY-MM-DD hh:mm:ss');

    if(addseconds > -1)
    {        
        date = moment(date,'YYYY-MM-DD hh:mm:ss').add(addseconds,'seconds').format('YYYY-MM-DD hh:mm:ss');
    }
    else
    {
        date = moment(date,'YYYY-MM-DD hh:mm:ss').subtract(addseconds,'seconds').format('YYYY-MM-DD hh:mm:ss');
    }

    if(addminutes > -1)
    {
        date = moment(date,'YYYY-MM-DD hh:mm:ss').add(addminutes,'minutes').format('YYYY-MM-DD hh:mm:ss');
    }
    else
    {
        date = moment(date,'YYYY-MM-DD hh:mm:ss').subtract(addminutes,'minutes').format('YYYY-MM-DD hh:mm:ss');
    }

    if(addhours > -1)
    {
        date = moment(date,'YYYY-MM-DD hh:mm:ss').add(addhours,'hours').format('YYYY-MM-DD hh:mm:ss');
    }
    else
    {
        date = moment(date,'YYYY-MM-DD hh:mm:ss').subtract(addhours,'hours').format('YYYY-MM-DD hh:mm:ss');
    }

    if(adddays > -1)
    {
        date = moment(date,'YYYY-MM-DD hh:mm:ss').add(adddays,'days').format('YYYY-MM-DD hh:mm:ss');
    }
    else
    {
        date = moment(date,'YYYY-MM-DD hh:mm:ss').subtract(adddays,'days').format('YYYY-MM-DD hh:mm:ss');
    }

    if(addmonths > -1)
    {
        date = moment(date,'YYYY-MM-DD hh:mm:ss').add(addmonths,'months').format('YYYY-MM-DD hh:mm:ss');
    }
    else
    {
        date = moment(date,'YYYY-MM-DD hh:mm:ss').subtract(addmonths,'months').format('YYYY-MM-DD hh:mm:ss');
    }

    if(addyears > -1)
    {
        date = moment(date,'YYYY-MM-DD hh:mm:ss').add(addyears,'years').format('YYYY-MM-DD hh:mm:ss');
    }
    else
    {
        date = moment(date,'YYYY-MM-DD hh:mm:ss').subtract(addyears,'years').format('YYYY-MM-DD hh:mm:ss');
    }
    
    return date;
};

function UpdateTable(table_name,key_value_pairs_in_json,target_row_query, callback){
    var obj = JSON.parse(JSON.stringify(key_value_pairs_in_json));
    var keys = Object.keys(obj);
    var update = "";
    for(var i = 0; i < keys.length; i++){
        if(i >= 1) update += ", ";
        update += keys[i]+" = '"+obj[keys[i]]+"'";
    }
    // console.log(update);
    
    var query = "update "+table_name+" set "+update+" where "+target_row_query;
    db.query(query, (error,result) => {
        if(error){ 
            callback(error,null);
        }else{
           callback(null,result); 
        }
    });
};

const InsertDataInTable = async (table_name,column_names,column_values, callback)=>{
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

const AnyDbQuery = async (AnyQuery,callback)=>{
    db.query(AnyQuery, (error,result) => {
        if(error){ 
            callback(error,null);
        }
        else
        {               
            callback(null,result);    
        }
    });
};

function LogEmail(to,from,subject,content,content_type,status, callback){
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

const Register = async (email,username,password,user_choice_type, callback) => {
    // console.log("inside register");
    password = await HashIt(password,10);
    const vkey = await HashIt(password+email,10);
    const accesskey = await HashIt(password+email+username+DateTime(),10);
    const otp = otpGenerate(3);
    const usertype = "student";
    const priority = "owner";
    const datetime = DateTime(0,0,0,0,0,0);
    const otpexpiry = DateTime(0,0,0,0,15,0);
    // first check if user is already registered or not
    AnyDbQuery("select username from accounts where email='"+email+"'",(error,result)=>{
        // console.log("searching user...");
        if(error)
        {
            callback(error,null); 
            console.log("Error : "+error); 
        }
        else
        {
            // console.log(Object.values(JSON.parse(JSON.stringify(result))).length);
            if(Object.values(JSON.parse(JSON.stringify(result))).length)
            {
                callback(null,0); //already registered
            }
            else
            {
                InsertDataInTable("accounts","id,profile_photo,username,email,password,vkey,access_key,otp,user_type,user_choice_type,priority,description,otp_expiry,updated_datetime,created_datetime","'','default.png','"+username+"','"+email+"','"+password+"','"+vkey+"','"+accesskey+"','"+otp+"','"+usertype+"','"+user_choice_type+"','"+priority+"','','"+otpexpiry+"','"+datetime+"','"+datetime+"'",(error,result)=>{
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

