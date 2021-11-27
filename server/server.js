const express = require("express");
const fs = require("fs");
// var bodyParser = require("body-parser");
const path = require('path');
const app = express();
require('dotenv').config({ path: '../../private/config.env'});
// require('./dbcreate.js');
const dbfunctions = require('./dbfunctions');
const SendEmail = require('./email.js');
// const session = require('express-session');
const cookie_parser = require('cookie-parser');
const LearnRoadmap = require('./roadmaps_functions.js');
const multer = require('multer');
const e = require("express");
var storage = multer.diskStorage({   
  destination: function(req, file, cb) { 
     cb(null, 'public/assets/uploaded_roadmaps');    
  }, 
  filename: function (req, file, cb) { 
     cb(null , file.originalname);   
  }
});
const upload = multer({
  storage:storage,
  limits : {fileSize : 2000000},
});

app.set('view engine','ejs');

app.use(cookie_parser('sd6f5y1k66f5v1d6fv16c61da5fh1s651v68tf1v6s'));

app.use(express.urlencoded({extended:true}));
app.use(express.json());

app.use('/css',express.static(path.join(__dirname,'../public/assets/css')));
app.use('/js',express.static(path.join(__dirname,'../public/assets/js')));
app.use('/images',express.static(path.join(__dirname,'../public/assets/images')));
app.use('/favicon',express.static(path.join(__dirname,'../public/assets/favicon')));
app.use('/views',express.static(path.join(__dirname,'../public/views')));

app.get("*", (req, res) => {  
  let user_signed_cookie = req.signedCookies.user;
  if(user_signed_cookie)
  {    
    res.render(path.join(__dirname, '../public/views/frame.ejs'),{"locals":{"user":user_signed_cookie}});
  }
  else
  {
    res.render(path.join(__dirname, '../public/views/frame.ejs'));
  }
});

app.get("/:page", (req, res) => {
  let user_signed_cookie = req.signedCookies.user;
  if(user_signed_cookie)
  {    

    switch(req.params.page.toLowerCase())
    {
        case 'logout':{
          res.clearCookie("user");
          res.redirect(path.join(__dirname, '../public/views/frame.ejs'));
        }break;
        default:{
          res.render(path.join(__dirname, '../public/views/frame.ejs'),{"locals":{"user":{"email":user_signed_cookie}}});
        }
    }
  }
  else
  {
    res.render(path.join(__dirname, '../public/views/frame.ejs'));
  }
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
    switch(req.body.page.toLowerCase())
    {
      case 'logout':{
        res.sendFile(path.join(__dirname, '../public/views/index.html')); 
      }break;
      case 'account':{
        let user_signed_cookie = req.signedCookies.user;
        if(user_signed_cookie)
        {
          dbfunctions.AnyDbQuery("select priority from accounts where email='"+user_signed_cookie+"'",(error,result)=>{
            if(error)
            {
              console.log(error);
            }
            else
            { 
              if(Object.values(JSON.parse(JSON.stringify(result))))
              {
                  row = result[0];
                  const priority = row.priority;
                  res.sendFile(path.join(__dirname, '../public/views/'+priority+'-account.html'));
              }
            }
          });
        }
        else
        {
          res.sendFile(path.join(__dirname, '../public/views/index.html')); 
        }
      }break;
      default:{
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
    }
  }
  else
  {
    //if home page
    res.sendFile(path.join(__dirname, '../public/views/index.html'));
  }
  
  
});

app.post('/roadmaps_api',upload.single("files"),(req,res)=>{  
  //giving directory name to the function to learn uploaded roadmaps.
  //as soon as a roadmap is learned it will be moved to roadmaps folder
  // console.log(req.file['destination']);
  LearnRoadmap(req.file['destination']+'/',(error,result)=>{
    if(error)
    {
      console.log(error);
    }
    else
    {
      console.log(result.affectedRows);
    }
  });
  res.send({"code":1,"description":"got it!!!"});
});

app.post('/user',async (req,res)=>{
  // console.log(JSON.stringify(req.body));

  if(req.body.hasOwnProperty('email')&&req.body.hasOwnProperty('username')&&req.body.hasOwnProperty('password'))
  {
    const email = req.body.email;
    const username = req.body.username;
    const password = req.body.password;
    var json = {};

    dbfunctions.Register(email,username,password,(error,result)=>{
      if(error)
      {
        console.log(error);
      }
      else
      {
        // console.log(result);
        switch(result)
        {
          case 0:{
            json = {"code":0,"description":"Email is already registered"};
            // console.log(json);
            res.send(json);
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
                  if(Object.values(JSON.parse(JSON.stringify(result))).length)
                  {
                    row = result[0];
                    const otp = row.otp;
                    const otp_expiry = row.otp_expiry;
                    SendEmail(email,"Your Mentor Account Verification OTP is "+otp,"html","Thankyou! for registering with Your Mentor.<br/> Your OTP(One Time Password) for account verification is <b>"+otp+"</b> and is <b>valid only till "+otp_expiry+"</b>",(error,result)=>{
                      if(error)
                      {
                         json = {"code":0,"description":"Unable to send email OTP"};
                      }
                      else
                      if(result.affectedRows)
                      {
                        console.log("email log inserted in db");
                        json = {"code":1,"description":"Registered! Please enter the OTP send on your email id"};
                      }
                      
                      // console.log(json);
                      res.send(json);
                    });
                  }
                }
            });      
          }break;
          case 2:{
            json = {"code":0,"description":"Unable to register"};
            // console.log(json);
            res.send(json);
          }break;
        }
      }
    });
    
    // console.log(json);
    // res.send(json);
  }
  else
  if(req.body.hasOwnProperty('email')&&req.body.hasOwnProperty('otpVerify'))
  {
    const otp = req.body.otpVerify;
    const email = req.body.email;
    var json = {};

    dbfunctions.AnyDbQuery("select otp from accounts where email='"+email+"'",(error,result)=>{
      if(error)
      {
        console.log(error);
      }
      else
      {
        if(Object.values(JSON.parse(JSON.stringify(result))).length)
        {
          // console.log(result);
          var row = result[0];
          if(row.otp === otp)
          {
              //verify the account
              dbfunctions.UpdateTable("accounts",{'verified':'1'},"email='"+email+"'",(error,result)=>{
                if(error)
                {
                  console.log(error);
                }
                else
                {
                  if(result.affectedRows)
                  {
                    let user_signed_cookie = req.signedCookies.user;
                    //But the user is logging in for the first time so there won't be any appropriate signed cookie for usage.
                    json = {"code":1,"description":"Account verified!"};  
                    if(!user_signed_cookie) //true in our case
                    {
                      res.cookie('user',email,{signed:true});
                    }
                  }
                  else
                  {
                    json = {"code":0,"description":"Unable to verify your account, please try after some time."};
                  }

                  res.send(json);
                }
              });
          }
          else
          {
            json = {"code":0,"description":"Invalid OTP"};
            res.send(json);
          }
        }
        else
        {
          json = {"code":0,"description":"Invalid OTP"};
          res.send(json);
        }
      }
    });
  }
  else
  if(req.body.hasOwnProperty('email')&&req.body.hasOwnProperty('post-request'))
  {
    const request = req.body.post-request;
    const email = req.body.email;
    var json = {};

    switch(request)
    {
      case 'new-otp':{
        dbfunctions.AnyDbQuery("select otp,otp-expire from accounts where email='"+email+"'",(error,result)=>{
          if(error)
          {
            console.log(error);
          }
          else
          {
            if(Object.value(JSON.parse(JSON.stringify(result))).length)
            {
              row = result[0];
              const otp = row.otp;
              const expire = row.otp-expire;
              SendEmail(email,otp+" is your OTP | Your Mentor","html",otp+" is your OTP for your account and is valid till "+expire,(error,result)=>{
                if(error)
                {
                  console.log(error);
                }
                else
                {
                  if(result.affectedRows)
                  {
                    json = {"code":1,"description":"OTP has been sent!"};
                    res.send(json);
                  }
                  else
                  {
                    json = {"code":0,"description":"unable to send otp"};
                    res.send(json);
                  }
                }
              });
            }
            else
            {
              const otp = dbfunctions.otpGenerate(6);
              const expiry = dbfunctions.DateTime(0,0,0,0,15,0);
    
              dbfunctions.UpdateTable("accounts",{'otp':otp,'otp-expiry':expiry},"email='"+email+"'",(error,result)=>{
                if(error)
                {
                  console.log(error);  
                }
                else
                {
                  if(result.affectedRows)
                  {
                    SendEmail(email,otp+" is your OTP | Your Mentor","html",otp+" is your OTP for your account and is valid till "+expiry,(error,result)=>{
                      if(error)
                      {
                        console.log(error);
                      }
                      else
                      {
                        if(result.affectedRows)
                        {
                          json = {"code":1,"description":"OTP has been sent!"};
                          res.send(json);
                        }
                        else
                        {
                          json = {"code":0,"description":"unable to send otp"};
                          res.send(json);
                        }
                      }
                    });
                  }
                  else
                  {
                    json = {"code":0,"description":"unable to generate new otp, please try again after some time"};
                    res.send(json);
                  }
                }
              });
            }
          }
        });
      }break;
    }
  }
  else
  if(req.body.hasOwnProperty('email')&&req.body.hasOwnProperty('password'))
  {
    //Login
    const email = req.body.email;
    const password = req.body.password;
    var json = {};

    dbfunctions.AnyDbQuery("select id,password,verified,otp,otp_expiry from accounts where email='"+email+"'",(error,result)=>{
      if(error)
      {
        console.log(error);
      }
      else
      {
        if(Object.values(JSON.parse(JSON.stringify(result))).length)
        {
          //user is registered
          const row = result[0];
          const id = row.id;
          const verified = row.verified;
          const hashedPass = row.password;
          const otp = row.otp;
          const otp_expiry = row.otp_expiry;

            dbfunctions.compareIt(password,hashedPass,(error,result)=>{
              if(error)
              {
                console.log(error);
              }
              else
              {
                console.log(result);
                if(result)
                {
                  //passwords matched
                  if(verified == "1")
                  {
                    //account is verified
                    dbfunctions.InsertDataInTable("user_history","id,user_id,action,updated_datetime,create_datetime","'','"+id+"','Login success','"+dbfunctions.DateTime(0,0,0,0,0,0)+"','"+dbfunctions.DateTime(0,0,0,0,0,0)+"'",(error,result)=>{
                      if(error)
                      {
                        console.log(error);
                      }
                    });
                    
                    let user_signed_cookie = req.signedCookies.user;
                    if(!user_signed_cookie) //true in our case
                    {
                      res.cookie('user',email,{signed:true});
                    }
                    
                    json = {"code":1,"description":"Logging in..."};
                    res.send(json);
                  }
                  else
                  {
                    //account is not verified
                    //send verification otp email
                    SendEmail(email,"Your Mentor Account Verification OTP is "+otp,"html","Thankyou! for registering with Your Mentor.<br/> Your OTP(One Time Password) for account verification is <b>"+otp+"</b> and is <b>valid only till "+otp_expiry+"</b>",(error,result)=>{
                      if(error)
                      {
                         json = {"code":0,"description":"Unable to send email OTP"};
                      }
                      else
                      if(result.affectedRows)
                      {
                        console.log("email log inserted in db");
                        json = {"code":2,"description":"Please enter the OTP send on your email id"};
                      }

                      // console.log(json);
                      res.send(json);
                    });
                  }                  
                }
                else
                {
                  //passwords didn't match
                  dbfunctions.InsertDataInTable("user_history","id,user_id,action,updated_datetime,create_datetime","'','"+id+"','Login failed. Password didn't match','"+dbfunctions.DateTime(0,0,0,0,0,0)+"','"+dbfunctions.DateTime(0,0,0,0,0,0)+"'",(error,result)=>{
                    if(error)
                    {
                      console.log(error);
                    }
                  });
                  
                  json = {"code":0,"description":"wrong password"};
                  res.send(json);
                }
              }
            });                   
        }
      }
    });
  }
});

app.post('/roadmap',(req,res)=>{
  //get the designation name and search for its roadmap
  //if present then send that roadmap.
  if(req.body.hasOwnProperty('designation'))
  {
   var designation = req.body.designation;
    designation = designation.split('-');
    var designation_name = "";
    designation.forEach((word,index)=>{
      designation_name += word[0].toUpperCase() + word.slice(1);
      if(index < designation.length - 1)
      {
        designation_name += " "
      }
    });
    console.log(designation_name);
    dbfunctions.AnyDbQuery("select department_id,roadmap from designation where designation_name='"+designation_name+"'",(error,result)=>{
      if(error)
      {
        console.log(error);
      }
      else
      {
        if(Object.values(JSON.parse(JSON.stringify(result))).length)
        {
          //if designation is present in database
          // now get the department name using department id
          var department_id = result[0].department_id;
          var roadmap = result[0].roadmap;
          dbfunctions.AnyDbQuery("select department_name from fields_departments where id='"+department_id+"'",(error,result)=>{
            if(error)
            {
              console.log(error);
            }
            else
            {
                if(Object.values(JSON.parse(JSON.stringify(result))).length)
                {
                  var department_name = result[0].department_name;
                  res.send({"code":1,"department":department_name,"designation":designation_name,"roadmap":roadmap});
                }
            }
          });
        }
        else
        {
          res.send({"code":0});
        }
      }
    });
  }
});

app.listen(3001, () => {
  console.log("app listening on port 3001")
})
