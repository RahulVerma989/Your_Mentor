const nodemailer = require('nodemailer');
const {LogEmail}= require('./dbfunctions.js');

var transporter = nodemailer.createTransport({
    service:process.env.EMAIL_SERVICE,
    auth:{
        user:process.env.EMAIL_USERNAME,
        pass:process.env.EMAIL_PASSWORD
    }
});


const SendEmail = async (SendTo,EmailSubject,ContentType = 'text',Content) => {
    var mailOptions;

    if(ContentType == 'text')
    {
        mailOptions = {
            from: process.env.EMAIL_FROM,
            to: SendTo,
            subject:EmailSubject,
            text:Content
        };
    }
    else
    {
        mailOptions = {
            from: process.env.EMAIL_FROM,
            to: SendTo,
            subject:EmailSubject,
            html:Content
        };
    }

    transporter.sendMail(mailOptions, (error,info) => {
        if(error){
          console.log(error);
          LogEmail(SendTo,process.env.EMAIL_FROM,EmailSubject,Content,ContentType,error);
        }
        else{
            console.log('Email Sent!\n');
            // console.log(info.response);

            //log in the database
            LogEmail(SendTo,process.env.EMAIL_FROM,EmailSubject,Content,ContentType,'delivered');
        }
    });
    
}

module.exports = SendEmail;