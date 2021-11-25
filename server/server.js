const express = require("express");
const fs = require("fs");
// var bodyParser = require("body-parser");
const path = require('path');
const app = express();
require('dotenv').config({ path: '../../private/config.env'});
// require('./dbcreate.js');
// const dbfunctions = require('./dbfunctions');
// const SendEmail = require('./email.js');

app.use(express.urlencoded({extended:true}));
app.use(express.json());

app.use('/css',express.static(path.join(__dirname,'../public/assets/css')));
app.use('/js',express.static(path.join(__dirname,'../public/assets/js')));
app.use('/images',express.static(path.join(__dirname,'../public/assets/images')));
app.use('/favicon',express.static(path.join(__dirname,'../public/assets/favicon')));
app.use('/views',express.static(path.join(__dirname,'../public/views')));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, '../public/views/frame.html'));
});

app.get("/:page", (req, res) => {
    res.sendFile(path.join(__dirname, '../public/views/frame.html'));
});

function PageNotFoundData(){
  const pageNotfound = "../public/views/page-not-found.html";
  // console.log(fs.existsSync(path.join(__dirname, pageNotfound)));
  if(fs.existsSync(path.join(__dirname, pageNotfound)))
  {
    return fs.readFileSync(path.join(__dirname, pageNotfound),{encoding:'utf8',flag:'r'});
  }else{
    return "Page Not Found";
  }
  
}

app.post('/fetch-page',async (req,res)=>{
  //read request file if available and send its content as a result
  const home = ['/','index','home'];
  if(home.indexOf(req.body.page) == -1)
  {
    const FilePath = "../public/views/"+req.body.page.toLowerCase()+".html";
    if(fs.existsSync(path.join(__dirname, FilePath)))
    {
          fs.readFile(path.join(__dirname, FilePath),{encoding:'utf8',flag:'r'},(error,data) => {
          if(error){
            res.send(PageNotFoundData());
          }
          else{
            res.send(data);
          }
        });
    }
    else{    
      // console.log('does not exists!!');
      res.send(PageNotFoundData());
    }
  }
  else
  {
    res.sendFile(path.join(__dirname, '../public/views/index.html'));
  }
  
  
});

app.post('/road-maps-api/:apikey',async (req,res)=>{
  json = JSON.parse(req);
  console.log(json);
});

app.post('/user',async (req,res)=>{
  console.log(JSON.stringify(req.body));
  
  var json;

  if(req.body.hasOwnProperty('email')&&req.body.hasOwnProperty('username')&&req.body.hasOwnProperty('password'))
  {
    const email = req.body.email;
    const username = req.body.username;
    const password = req.body.password;
    dbfunctions.Register(email,username,password,(error,result)=>{
      if(error)
      {
        console.log(error);
      }
      else
      {
        // console.log(result);
        switch(parseInt(result))
        {
          case 0:{
            json = {"code":0,"description":"Email is already registered"};
          }break;
          case 1:{
            // get otp and expiry date 
              dbfunctions.AnyDbQuery("select otp,otp_expiry from accounts where email='"+email+"'", function(error,result){
                if(error)
                {
                  console.log(error);
                }
                else
                {
                  // console.log(result);
                  // console.log(result[0].otp);
                  // console.log(result[0].otp_expiry);
                  if(Object.values(JSON.parse(JSON.stringify(result))).length)
                  {
                    row = result[0];
                    const otp = row.otp;
                    const otp_expiry = row.otp_expiry;
                    SendEmail(email,"Your Mentor Account Verification OTP is "+otp,"text","Thankyou! for registering with Your Mentor. Your OTP(One Time Password) for account verification is "+otp+", and is valid only till "+otp_expiry,(error,result)=>{
                      if(error)
                      {
                         json = {"code":0,"description":"Unable to send email OTP"};
                      }
                      else
                      if(result.affectedRows)
                      {
                        json = {"code":1,"description":"Registered! Please enter the OTP send on your email id"};
                      }
                    });
                  }
                }
            });      
          }break;
          case 2:{
            json = {"code":0,"description":"Unable to register"};
          }break;
        }

      }
    });
  }
  else
  if(req.body.hasOwnProperty('email')&&req.body.hasOwnProperty('otpVerify'))
  {
    const otp = req.body.otpVerify;
    const email = req.body.email;
    var json;
    dbfunctions.AnyDbQuery("select otp from accounts where email='"+email+"' and otp-expire>='"+dbfunctions.DateTime()+"'",(error,result)=>{
      if(error)
      {
        console.log(error);
      }
      else
      {
        if(Object.values(JSON.parse(JSON.stringify(result))).length)
        {
          console.log(result);
          var row = result[0];
          if(row.otp === otp)
          {
              //verify the account
              dbfunctions.UpdateTable("accounts",{"verified":1},"email='"+email+"'",(error,result)=>{
                if(error)
                {
                  console.log(error);
                }
                else
                {
                  if(result.affectedRows)
                  {
                    json = {"code":1,"description":"Account verified!"};
                  }
                  else
                  {
                    json = {"code":0,"description":"Unable to verify your account, please try after some time."};
                  }
                }
              });
          }
          else
          {
            json = {"code":0,"description":"Invalid OTP"};
          }
        }
        else
        {
          json = {"code":0,"description":"Invalid OTP"};
        }
      }
    });
  }
  else
  if(req.body.hasOwnProperty('email')&&req.body.hasOwnProperty('post-request'))
  {
    const request = req.body.post-request;
    const email = req.body.email;
    var json;

    switch(request)
    {
      case 'new-otp':{
        dbfunctions.AnyDbQuery("select otp,otp-expire from accounts where email='"+email+"' and otp_expiry>='"+dbfunctions.DateTime()+"'",(error,result)=>{
          if(error)
          {
            console.log(error);
          }
          else
          {
            if(row = JSON.parse(JSON.stringify(result[0])))
            {
              const otp = row.otp;
              const expire = row.otp-expire;
              SendEmail(email,otp+" is your OTP | Your Mentor","text",otp+" is your OTP for your account and is valid till "+expire,(error,result)=>{
                if(error)
                {
                  console.log(error);
                }
                else
                {
                  if(result.affectedRows)
                  {
                    json = {"code":1,"description":"OTP has been sent!"};
                  }
                  else
                  {
                    json = {"code":0,"description":"unable to send otp"};
                  }
                }
              });
            }
            else
            {
              const otp = dbfunctions.otpGenerate(6);
              const expiry = dbfunctions.DateTime(0,0,0,0,15,0);
    
              dbfunctions.UpdateTable("accounts",{"otp":otp,"otp-expiry":expiry},"email='"+email+"'",(error,result)=>{
                if(error)
                {
                  console.log(error);  
                }
                else
                {
                  if(result.affectedRows)
                  {
                    SendEmail(email,otp+" is your OTP | Your Mentor","text",otp+" is your OTP for your account and is valid till "+expire,(error,result)=>{
                      if(error)
                      {
                        console.log(error);
                      }
                      else
                      {
                        if(result.affectedRows)
                        {
                          json = {"code":1,"description":"OTP has been sent!"};
                        }
                        else
                        {
                          json = {"code":0,"description":"unable to send otp"};
                        }
                      }
                    });
                  }
                  else
                  {
                    json = {"code":0,"description":"unable to generate new otp, please try again after some time"};
                  }
                }
              });
            }
          }
        });
      }break;
    }
  }

  res.send(json);
});

app.listen(3001, () => {
  console.log("app listening on port 3001")
})
