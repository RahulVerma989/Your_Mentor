const nodemailer = require('nodemailer');
const {LogEmail}= require('./dbfunctions.js');

var transporter = nodemailer.createTransport({
    host:"smtp.gmail.com",
    port:465,
    service:process.env.EMAIL_SERVICE || "gmail",
    auth:{
        user:process.env.EMAIL_USERNAME || "yourmentor.ml@gmail.com",
        pass:process.env.EMAIL_PASSWORD || "YourMentor.ML"
    }
});


const SendEmail = async (SendTo,EmailSubject,ContentType = 'text',Content,callback) => {
    var mailOptions;
    const from = process.env.EMAIL_FROM || "yourmentor.ml@gmail.com";

    if(ContentType == 'text')
    {
        mailOptions = {
            from: from,
            to: SendTo,
            subject:EmailSubject,
            text:Content
        };
    }
    else
    {
        mailOptions = {
            from: from,
            to: SendTo,
            subject:EmailSubject,
            html:Content
        };
    }

    transporter.sendMail(mailOptions, (error,info) => {
        if(error){
            console.log(error);
            LogEmail(SendTo,from,EmailSubject,Content,ContentType,error,(error,result)=>{
                 if(error)
                 {
                    //  console.log(error);
                     callback(error,null);
                 }
                 else
                 {
                    //  console.log(result);
                     callback(null,result);
                 }
             });
        }
        else{
            console.log('Email Sent!');

            //log in the database
            LogEmail(SendTo,from,EmailSubject,Content,ContentType,'delivered',(error,result)=>{
                if(error)
                {
                   //  console.log(error);
                   callback(error,null);
                }
                else
                {
                    // console.log(result);
                    callback(null,result);
                }
            });
        }
    });
    
}

module.exports = SendEmail;