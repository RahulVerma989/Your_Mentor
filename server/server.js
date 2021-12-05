const express = require("express");
const fs = require("fs");
// var bodyParser = require("body-parser");
const path = require('path');
const app = express();
require('dotenv').config({ path: '../../private/config.env'});
// require('./dbcreate.js');
const dbfunctions = require('./dbfunctions');
const SendEmail = require('./email.js');
const cookie_parser = require('cookie-parser');
const LearnRoadmap = require('./roadmaps_functions.js');
const multer = require('multer');
const moment = require('moment');

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
    // console.log(req.params.page.toLowerCase());
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
              if(Object.values(JSON.parse(JSON.stringify(result))).length)
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

  if(req.body.hasOwnProperty('email')&&req.body.hasOwnProperty('username')&&req.body.hasOwnProperty('password')&&req.body.hasOwnProperty('user_choice_type'))
  {
    const email = req.body.email;
    const username = req.body.username;
    const password = req.body.password;
    const user_choice_type = req.body.user_choice_type;
    var json = {};

    dbfunctions.Register(email,username,password,user_choice_type,(error,result)=>{
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
    var datetime = dbfunctions.DateTime();

    dbfunctions.AnyDbQuery("select otp from accounts where email='"+email+"' AND otp_expiry >= '"+datetime+"' ",(error,result)=>{
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
    var datetime = dbfunctions.DateTime();

    switch(request)
    {
      case 'new-otp':{
        dbfunctions.AnyDbQuery("select otp,otp-expire from accounts where email='"+email+"' and otp_expiry >= '"+datetime+"'",(error,result)=>{
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
              const otp = dbfunctions.otpGenerate(3);
              const expiry = dbfunctions.DateTime(0,0,0,0,15,0);
    
              dbfunctions.UpdateTable("accounts",{'otp':otp,'otp_expiry':expiry},"email='"+email+"'",(error,result)=>{
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
          var otp = row.otp;
          var otp_expiry = row.otp_expiry;
          var datetime = dbfunctions.DateTime();

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
                    if(moment(otp_expiry).isAfter(datetime))
                    {
                      //if otp if not expired yet then send the email with expiry time
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
                    else
                    {
                        otp = dbfunctions.otpGenerate(3);
                        otp_expiry = dbfunctions.DateTime(0,0,0,0,15,0);

                        dbfunctions.UpdateTable("accounts",{'otp':otp,'otp_expiry':otp_expiry},"email='"+email+"'",(error,result)=>{
                          if(error)
                          {
                            console.log(error);  
                          }
                          else
                          {
                            if(result.affectedRows)
                            {
                              SendEmail(email,otp+" is your OTP | Your Mentor","html",otp+" is your OTP for your account and is valid till "+otp_expiry,(error,result)=>{
                                if(error)
                                {
                                  json = {"code":0,"description":"Unable to send email OTP"};
                                }
                                else
                                {
                                  if(result.affectedRows)
                                  {
                                    json = {"code":2,"description":"Please enter the OTP send on your email id"};
                                    
                                  }
                                  else
                                  {
                                    json = {"code":0,"description":"Unable to send otp"};
                                  }
                                }
                                res.send(json);
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
  else
  if(req.body.hasOwnProperty('goal'))
  {
    dbfunctions.AnyDbQuery("select id,department_name from fields_departments",(error,result)=>{
      if(error)
      {
        console.log(error);
      }
      else
      {
        if(Object.values(JSON.parse(JSON.stringify(result))).length)
        {
            const departments =  JSON.parse(JSON.stringify(result));

            dbfunctions.AnyDbQuery("select department_id,designation_name from designation",(error,result)=>{
              if(error)
              {
                console.log(error);
              }
              else
              {
                if(Object.values(JSON.parse(JSON.stringify(result))).length)
                {
                  const designations = JSON.parse(JSON.stringify(result));
                  // console.log(designations);
                  var json = {};
                  departments.map((department)=>{
                    var designations_array = [];
                    designations.map((designation)=>{
                      if(department.id == designation.department_id)
                      {                        
                        designations_array.push(designation.designation_name);
                      }
                    });
                    json[department.department_name] = designations_array;
                  });

                  res.send(json);
                }
              }
            });
        }
      }
    });
  }
});

app.post('/forum',async (req,res)=>{ 
  if(req.body.hasOwnProperty('question')&&req.body.hasOwnProperty('description'))
  {
    if(req.signedCookies.user)
    {
      var email = req.signedCookies.user;
      dbfunctions.AnyDbQuery("select id from accounts where email='"+email+"'",(error,result)=>{
        if(error)
        {
          throw error;
        }
        else
        {
          if(Object.values(JSON.parse(JSON.stringify(result))).length)
          {
            // user is logged in
            //then store its post
            //get user id
            const user_id = result[0].id;
            const title = req.body.question;
            const description = req.body.description;
            const datetime = dbfunctions.DateTime();

            // console.log(title+' | '+description+' | '+datetime);
            dbfunctions.InsertDataInTable("threads","id,user_id,title,description,status,posts_count,updated_datetime,created_datetime","'','"+user_id+"','"+title+"','"+description+"','open','1','"+datetime+"','"+datetime+"'",(error,result)=>{
              if(error)
              {
                throw error;
              }
              else
              {
                if(result.affectedRows)
                {
                  dbfunctions.InsertDataInTable("posts","id,user_id,thread_id,thread_answer,title,tags,description,views,likes,unlikes,shares,updated_datetime,created_datetime","'','"+user_id+"','"+result.insertId+"','','"+title+"','','"+description+"','','','','','"+datetime+"','"+datetime+"'",(error,posts_result)=>{
                    if(error)
                    {
                      throw error;
                    }
                    else
                    if(posts_result.affectedRows)
                    {
                      res.send({"code":1,"description":"Posted!"}); 
                    }
                    else
                    {
                      res.send({"code":0,"description":"unable to post, try again after some time."}); 
                    }
                  });                 
                }
                else
                {
                  res.send({"code":0,"description":"unable to post, try again after some time."}); 
                }
              }
            });       
          }
          else
          {
            //either user is not logged in or cookie is tampered
            res.send({"code":0,"description":"Please login first"});
          }
        }
      });
    }
    else
    {
      //user is not logged in
      res.send({"code":0,"description":"Please login first"});
    }
  }
  else
  if(req.body.hasOwnProperty('query'))
  {
    const query = req.body.query;

    GetSearchResults(query,(error,result)=>{
      if(error)
      {
        console.log(error);
      }
      else
      {
        res.send(result);
      }
    });
  }
  else
  if(req.body.hasOwnProperty('Thread')&&req.body.hasOwnProperty('ParentType')&&req.body.hasOwnProperty('Id')&&req.body.hasOwnProperty('action')&&req.body.hasOwnProperty('actionValue'))
  {
    if(req.signedCookies.user)
    {
      var email = req.signedCookies.user;
      dbfunctions.AnyDbQuery("select id from accounts where email='"+email+"'",(error,user_result)=>{
        if(error)
        {
          throw error;
        }
        else
        {
          if(Object.values(JSON.parse(JSON.stringify(user_result))).length)
          {
            const userId = user_result[0].id;
            const rowId = parseInt(req.body.Id);
            const action = req.body.action.toLowerCase();
            const actionValue = parseInt(req.body.actionValue);
            const thread = req.body.Thread.split("-").join(" ").toLowerCase();
            //like, dislike and share actions
            switch(ParentType.toLowerCase())
            {
              case 'post':{
                dbfunctions.AnyDbQuery("select id,likes,dislikes,share from threads where LOWER('title')='"+thread+"' ",(error,thread_result)=>{
                  if(error)
                  {
                    console.log(error);
                  }
                  else
                  if(Object.values(JSON.parse(JSON.stringify(thread_result))).length)
                  {
                    if(rowId == thread_result[0].id)
                    {
                      //if it was the thread post
                      if(actionValue)
                      {
                        //something needs to add
                        if(action == 'likes')
                        {
                          //first check if there is dislike or not if present then delete it 
                          dbfunctions.AnyDbQuery("select id from threads_dislikes where user_id='"+userId+"' and thread_id='"+rowId+"'",(error,result)=>{
                            if(error)
                            {
                              console.log(error);
                            }
                            else
                            if(Object.values(JSON.parse(JSON.stringify(result))).length)
                            {
                              //there is a dislike of this thread form this user. delete it
                              dbfunctions.AnyDbQuery("DELETE from threads_dislikes where id='"+result[0].id+"'",(error,result)=>{
                                if(error)
                                {
                                  console.log(error);
                                }
                                else
                                if(result.affectedRows)
                                {
                                    //now insert like in the threads_likes table
                                    dbfunctions.InsertDataInTable("threads_likes","id,user_id,thread_id,created_datetime","'','"+userId+"','"+rowId+"','"+dbfunctions.DateTime()+"'",(error,result)=>{
                                        if(error)
                                        {
                                          console.log(error);
                                        }
                                        else
                                        {
                                          res.send({"code":1,"description":"thread like stored"})
                                        }
                                    });
                                }
                                else
                                {
                                  res.send({"code":0,"description":"unable to delete your dislike on this thread"});
                                }
                              }); 
                            }
                          });                    
                        }
                        else
                        if(action == 'dislikes')
                        {
                          //first check if there is like or not if present then delete it 
                          dbfunctions.AnyDbQuery("select id from threads_likes where user_id='"+userId+"' and thread_id='"+rowId+"'",(error,result)=>{
                            if(error)
                            {
                              console.log(error);
                            }
                            else
                            if(Object.values(JSON.parse(JSON.stringify(result))).length)
                            {
                              //there is a like of this thread form this user. delete it
                              dbfunctions.AnyDbQuery("DELETE from threads_likes where id='"+result[0].id+"'",(error,result)=>{
                                if(error)
                                {
                                  console.log(error);
                                }
                                else
                                if(result.affectedRows)
                                {
                                    //now insert dislike in the threads_dislikes table
                                    dbfunctions.InsertDataInTable("threads_dislikes","id,user_id,thread_id,created_datetime","'','"+userId+"','"+rowId+"','"+dbfunctions.DateTime()+"'",(error,result)=>{
                                        if(error)
                                        {
                                          console.log(error);
                                        }
                                        else
                                        if(result.affectedRows)
                                        {
                                          res.send({"code":1,"description":"thread like stored"});
                                        }
                                        else
                                        {
                                          res.send({"code":0,"description":"unable to dislike this thread"});
                                        }
                                    });
                                }
                                else
                                {
                                  res.send({"code":0,"description":"unable to delete your like on this thread"});
                                }
                              }); 
                            }
                          });      
                        }
                        else
                        if(action == 'share')
                        {
                          dbfunctions.UpdateTable("threads",{[action]:thread_result[0].share + actionValue},"id='"+rowId+"'",(error,result)=>{
                            if(error)
                            {
                              console.log(error);
                            }
                            else
                            if(result.affectedRows)
                            {
                              res.send({"code":1,"description":"sharing action logged"});
                            }
                            else
                            {
                              res.send({"code":1,"description":"unable to log sharing action"});
                            }
                          });
                        }
                      }
                      else
                      {
                        // something need to remove
                        if(action == 'likes')
                        {
                          //first check if there is like or not if present then delete it 
                          dbfunctions.AnyDbQuery("select id from threads_likes where user_id='"+userId+"' and thread_id='"+rowId+"'",(error,result)=>{
                            if(error)
                            {
                              console.log(error);
                            }
                            else
                            if(Object.values(JSON.parse(JSON.stringify(result))).length)
                            {
                              //there is a dislike of this thread form this user. delete it
                              dbfunctions.AnyDbQuery("DELETE from threads_likes where id='"+result[0].id+"'",(error,result)=>{
                                if(error)
                                {
                                  console.log(error);
                                }
                                else
                                if(result.affectedRows)
                                {
                                    res.send({"code":1,"description":"like has been deleted for this thread"});
                                }
                                else
                                {
                                  res.send({"code":0,"description":"unable to delete your like on this thread"});
                                }
                              }); 
                            }
                          });                    
                        }
                        else
                        if(action == 'dislikes')
                        {
                          //first check if there is dislike or not if present then delete it 
                          dbfunctions.AnyDbQuery("select id from threads_dislikes where user_id='"+userId+"' and thread_id='"+rowId+"'",(error,result)=>{
                            if(error)
                            {
                              console.log(error);
                            }
                            else
                            if(Object.values(JSON.parse(JSON.stringify(result))).length)
                            {
                              //there is a dislike of this thread form this user. delete it
                              dbfunctions.AnyDbQuery("DELETE from threads_dislikes where id='"+result[0].id+"'",(error,result)=>{
                                if(error)
                                {
                                  console.log(error);
                                }
                                else
                                if(result.affectedRows)
                                {
                                    res.send({"code":1,"description":"your dislike for this thread has been deleted"});
                                }
                                else
                                {
                                  res.send({"code":0,"description":"unable to delete your like on this thread"});
                                }
                              }); 
                            }
                          });      
                        }
                      }
                    }
                    else
                    {
                      //it was not the thread it may be a reply post of this thread. 
                      //select id,likes,dislikes,share from posts where id='"+rowId+"' and thread_id='"+thread_result[0].id+"'"
                      dbfunctions.AnyDbQuery("select id,likes,dislikes,share from posts where id='"+rowId+"' and thread_id='"+thread_result[0].id+"'",(error,posts_result)=>{
                        if(error)
                        {
                          console.log(error);
                        }
                        else
                        if(Object.values(JSON.parse(JSON.stringify(posts_result))).length)
                        {
                            if(actionValue)
                            {
                              //something needs to add
                              if(action == 'likes')
                              {
                                //first check if there is dislike or not if present then delete it 
                                dbfunctions.AnyDbQuery("select id from posts_dislikes where user_id='"+userId+"' and post_id='"+rowId+"'",(error,result)=>{
                                  if(error)
                                  {
                                    console.log(error);
                                  }
                                  else
                                  if(Object.values(JSON.parse(JSON.stringify(result))).length)
                                  {
                                    //there is a dislike of this post form this user. delete it
                                    dbfunctions.AnyDbQuery("DELETE from posts_dislikes where id='"+result[0].id+"'",(error,result)=>{
                                      if(error)
                                      {
                                        console.log(error);
                                      }
                                      else
                                      if(result.affectedRows)
                                      {
                                          //now insert like in the posts_likes table
                                          dbfunctions.InsertDataInTable("posts_likes","id,user_id,post_id,created_datetime","'','"+userId+"','"+rowId+"','"+dbfunctions.DateTime()+"'",(error,result)=>{
                                              if(error)
                                              {
                                                console.log(error);
                                              }
                                              else
                                              if(result.affectedRows)
                                              {
                                                res.send({"code":1,"description":"post like stored"});
                                              }
                                              else
                                              {
                                                res.send({"code":0,"description":"unable to store post like"});
                                              }
                                          });
                                      }
                                      else
                                      {
                                        res.send({"code":0,"description":"unable to delete your dislike on this post"});
                                      }
                                    }); 
                                  }
                                  else
                                  {
                                    //check if like is already present
                                    dbfunctions.AnyDbQuery("select id from posts_likes where user_id='"+userId+"' and post_id='"+rowId+"'",(error,result)=>{
                                      if(error)
                                      {
                                        console.log(error);
                                      }
                                      else
                                      if(Object.values(JSON.parse(JSON.stringify(result))).length)
                                      {
                                        res.send({"code":0,"description":"like is already present"});
                                      }
                                      else
                                      {
                                        //now insert like in the posts_likes table
                                        dbfunctions.InsertDataInTable("posts_likes","id,user_id,post_id,created_datetime","'','"+userId+"','"+rowId+"','"+dbfunctions.DateTime()+"'",(error,result)=>{
                                            if(error)
                                            {
                                              console.log(error);
                                            }
                                            else
                                            if(result.affectedRows)
                                            {
                                              res.send({"code":1,"description":"post like stored"});
                                            }
                                            else
                                            {
                                              res.send({"code":0,"description":"unable to store post like"});
                                            }
                                        });
                                      }
                                    });
                                  }
                                });                    
                              }
                              else
                              if(action == 'dislikes')
                              {
                                //first check if there is like or not if present then delete it 
                                dbfunctions.AnyDbQuery("select id from posts_likes where user_id='"+userId+"' and post_id='"+rowId+"'",(error,result)=>{
                                  if(error)
                                  {
                                    console.log(error);
                                  }
                                  else
                                  if(Object.values(JSON.parse(JSON.stringify(result))).length)
                                  {
                                    //there is a like of this post form this user. delete it
                                    dbfunctions.AnyDbQuery("DELETE from posts_likes where id='"+result[0].id+"'",(error,result)=>{
                                      if(error)
                                      {
                                        console.log(error);
                                      }
                                      else
                                      if(result.affectedRows)
                                      {
                                          //now insert dislike in the posts_dislikes table
                                          dbfunctions.InsertDataInTable("posts_dislikes","id,user_id,thread_id,created_datetime","'','"+userId+"','"+rowId+"','"+dbfunctions.DateTime()+"'",(error,result)=>{
                                              if(error)
                                              {
                                                console.log(error);
                                              }
                                              else
                                              if(result.affectedRows)
                                              {
                                                res.send({"code":1,"description":"post like stored"});
                                              }
                                              else
                                              {
                                                res.send({"code":0,"description":"unable to dislike this post"});
                                              }
                                          });
                                      }
                                      else
                                      {
                                        res.send({"code":0,"description":"unable to delete your like on this post"});
                                      }
                                    }); 
                                  }
                                  else
                                  {
                                    //like is not present
                                    //check if dislike is present or not
                                    dbfunctions.AnyDbQuery("select id from posts_likes where user_id='"+userId+"' and post_id='"+rowId+"'",(error,result)=>{
                                      if(error)
                                      {
                                        console.log(error);
                                      }
                                      else
                                      if(Object.values(JSON.parse(JSON.stringify(result))).length)
                                      {
                                        //if present then do nothing
                                        res.send({"code":0,"description":"already disliked"});
                                      }
                                      else
                                      {
                                          //now insert dislike in the posts_dislikes table
                                          dbfunctions.InsertDataInTable("posts_dislikes","id,user_id,thread_id,created_datetime","'','"+userId+"','"+rowId+"','"+dbfunctions.DateTime()+"'",(error,result)=>{
                                            if(error)
                                            {
                                              console.log(error);
                                            }
                                            else
                                            if(result.affectedRows)
                                            {
                                              res.send({"code":1,"description":"post like stored"});
                                            }
                                            else
                                            {
                                              res.send({"code":0,"description":"unable to dislike this post"});
                                            }
                                          });
                                        }
                                    });                                     
                                  }
                                });      
                              }
                              else
                              if(action == 'share')
                              {
                                dbfunctions.UpdateTable("posts",{[action]:posts_result[0].share + actionValue},"id='"+rowId+"'",(error,result)=>{
                                  if(error)
                                  {
                                    console.log(error);
                                  }
                                  else
                                  if(result.affectedRows)
                                  {
                                    res.send({"code":1,"description":"sharing action logged"});
                                  }
                                  else
                                  {
                                    res.send({"code":1,"description":"unable to log sharing action"});
                                  }
                                });
                              }
                            }
                            else
                            {
                              // something need to remove
                              if(action == 'likes')
                              {
                                //first check if there is like or not if present then delete it 
                                dbfunctions.AnyDbQuery("select id from posts_likes where user_id='"+userId+"' and post_id='"+rowId+"'",(error,result)=>{
                                  if(error)
                                  {
                                    console.log(error);
                                  }
                                  else
                                  if(Object.values(JSON.parse(JSON.stringify(result))).length)
                                  {
                                    //there is a like of this post form this user. delete it
                                    dbfunctions.AnyDbQuery("DELETE from posts_likes where id='"+result[0].id+"'",(error,result)=>{
                                      if(error)
                                      {
                                        console.log(error);
                                      }
                                      else
                                      if(result.affectedRows)
                                      {
                                          res.send({"code":1,"description":"like has been deleted for this post"});
                                      }
                                      else
                                      {
                                        res.send({"code":0,"description":"unable to delete your like on this post"});
                                      }
                                    }); 
                                  }
                                  else
                                  {
                                    res.send({"code":0,"description":"like not present"});
                                  }
                                });                    
                              }
                              else
                              if(action == 'dislikes')
                              {
                                //first check if there is dislike or not if present then delete it 
                                dbfunctions.AnyDbQuery("select id from posts_dislikes where user_id='"+userId+"' and thread_id='"+rowId+"'",(error,result)=>{
                                  if(error)
                                  {
                                    console.log(error);
                                  }
                                  else
                                  if(Object.values(JSON.parse(JSON.stringify(result))).length)
                                  {
                                    //there is a dislike of this post form this user. delete it
                                    dbfunctions.AnyDbQuery("DELETE from posts_dislikes where id='"+result[0].id+"'",(error,result)=>{
                                      if(error)
                                      {
                                        console.log(error);
                                      }
                                      else
                                      if(result.affectedRows)
                                      {
                                          res.send({"code":1,"description":"your dislike for this post has been deleted"});
                                      }
                                      else
                                      {
                                        res.send({"code":0,"description":"unable to delete your like on this post"});
                                      }
                                    }); 
                                  }
                                  else
                                  {
                                    res.send({"code":0,"description":"no dislike present"});
                                  }
                                });      
                              }
                            }   
                        }
                      });
                    }
                  }
                });
              }break;
              case 'comment':{
                dbfunctions.AnyDbQuery("select id,likes,dislikes,share from threads where LOWER('title')='"+thread+"' ",(error,thread_result)=>{
                  if(error)
                  {
                    console.log(error);
                  }
                  else
                  if(Object.values(JSON.parse(JSON.stringify(thread_result))).length)
                  {
                    if(rowId == thread_result[0].id)
                    {
                      //thread is present and user is commenting in a thread
                      res.send({"code":0,"description":"comments are not allowed on threads"});
                    }
                    else
                    {
                      //it is not a thread id it may be a post but thread is present
                      dbfunctions.AnyDbQuery("select id,likes,dislikes,share from posts where id='"+rowId+"' and thread_id='"+thread_result[0].id+"'",(error,posts_result)=>{
                        if(error)
                        {
                          console.log(error);
                        }
                        else
                        if(Object.values(JSON.parse(JSON.stringify(posts_result))).length)
                        {
                          //it is a post
                          dbfunctions.AnyDbQuery("select id,likes,dislikes,share from posts_comments where id='"+rowId+"' and post_id='"+posts_result[0].id+"'",(error,posts_comments_result)=>{
                            if(error)
                            {
                              console.log(error);
                            }
                            else
                            if(Object.values(JSON.parse(JSON.stringify(posts_comments_result))).length)
                            {
                              if(actionValue)
                              {
                                //something needs to add
                                if(action == 'likes')
                                {
                                  //first check if there is dislike or not if present then delete it 
                                  dbfunctions.AnyDbQuery("select id from posts_comments_dislikes where user_id='"+userId+"' and posts_comment_id='"+rowId+"'",(error,result)=>{
                                    if(error)
                                    {
                                      console.log(error);
                                    }
                                    else
                                    if(Object.values(JSON.parse(JSON.stringify(result))).length)
                                    {
                                      //there is a dislike of this post comment form this user. delete it
                                      dbfunctions.AnyDbQuery("DELETE from posts_comments_dislikes where id='"+result[0].id+"'",(error,result)=>{
                                        if(error)
                                        {
                                          console.log(error);
                                        }
                                        else
                                        if(result.affectedRows)
                                        {
                                            //now insert like in the posts_likes table
                                            dbfunctions.InsertDataInTable("posts_comments_likes","id,user_id,posts_comment_id,created_datetime","'','"+userId+"','"+rowId+"','"+dbfunctions.DateTime()+"'",(error,result)=>{
                                                if(error)
                                                {
                                                  console.log(error);
                                                }
                                                else
                                                if(result.affectedRows)
                                                {
                                                  res.send({"code":1,"description":"comment like stored"});
                                                }
                                                else
                                                {
                                                  res.send({"code":0,"description":"unable to store comment like"});
                                                }
                                            });
                                        }
                                        else
                                        {
                                          res.send({"code":0,"description":"unable to delete your dislike on this post"});
                                        }
                                      }); 
                                    }
                                    else
                                    {
                                      //check if like is already present
                                      dbfunctions.AnyDbQuery("select id from posts_comments_likes where user_id='"+userId+"' and posts_comment_id='"+rowId+"'",(error,result)=>{
                                        if(error)
                                        {
                                          console.log(error);
                                        }
                                        else
                                        if(Object.values(JSON.parse(JSON.stringify(result))).length)
                                        {
                                          res.send({"code":0,"description":"like is already present"});
                                        }
                                        else
                                        {
                                          //now insert like in the posts_likes table
                                          dbfunctions.InsertDataInTable("posts_comments_likes","id,user_id,posts_comment_id,created_datetime","'','"+userId+"','"+rowId+"','"+dbfunctions.DateTime()+"'",(error,result)=>{
                                              if(error)
                                              {
                                                console.log(error);
                                              }
                                              else
                                              if(result.affectedRows)
                                              {
                                                res.send({"code":1,"description":"post like stored"});
                                              }
                                              else
                                              {
                                                res.send({"code":0,"description":"unable to store post like"});
                                              }
                                          });
                                        }
                                      });
                                    }
                                  });                    
                                }
                                else
                                if(action == 'dislikes')
                                {
                                  //first check if there is like or not if present then delete it 
                                  dbfunctions.AnyDbQuery("select id from posts_comments_likes where user_id='"+userId+"' and posts_comment_id='"+rowId+"'",(error,result)=>{
                                    if(error)
                                    {
                                      console.log(error);
                                    }
                                    else
                                    if(Object.values(JSON.parse(JSON.stringify(result))).length)
                                    {
                                      //there is a like of this post form this user. delete it
                                      dbfunctions.AnyDbQuery("DELETE from posts_comments_likes where id='"+result[0].id+"'",(error,result)=>{
                                        if(error)
                                        {
                                          console.log(error);
                                        }
                                        else
                                        if(result.affectedRows)
                                        {
                                            //now insert dislike in the posts_dislikes table
                                            dbfunctions.InsertDataInTable("posts_comments_dislikes","id,user_id,posts_comment_id,created_datetime","'','"+userId+"','"+rowId+"','"+dbfunctions.DateTime()+"'",(error,result)=>{
                                                if(error)
                                                {
                                                  console.log(error);
                                                }
                                                else
                                                if(result.affectedRows)
                                                {
                                                  res.send({"code":1,"description":"comment dislike stored"});
                                                }
                                                else
                                                {
                                                  res.send({"code":0,"description":"unable to dislike this comment"});
                                                }
                                            });
                                        }
                                        else
                                        {
                                          res.send({"code":0,"description":"unable to delete your like on this comment"});
                                        }
                                      }); 
                                    }
                                    else
                                    {
                                      //like is not present
                                      //check if dislike is present or not
                                      dbfunctions.AnyDbQuery("select id from posts_comments_likes where user_id='"+userId+"' and posts_comment_id='"+rowId+"'",(error,result)=>{
                                        if(error)
                                        {
                                          console.log(error);
                                        }
                                        else
                                        if(Object.values(JSON.parse(JSON.stringify(result))).length)
                                        {
                                          //if present then do nothing
                                          res.send({"code":0,"description":"already disliked"});
                                        }
                                        else
                                        {
                                            //now insert dislike in the posts_dislikes table
                                            dbfunctions.InsertDataInTable("posts_comments_dislikes","id,user_id,posts_comment_id,created_datetime","'','"+userId+"','"+rowId+"','"+dbfunctions.DateTime()+"'",(error,result)=>{
                                              if(error)
                                              {
                                                console.log(error);
                                              }
                                              else
                                              if(result.affectedRows)
                                              {
                                                res.send({"code":1,"description":"comment like stored"});
                                              }
                                              else
                                              {
                                                res.send({"code":0,"description":"unable to dislike this comment"});
                                              }
                                            });
                                          }
                                      });                                     
                                    }
                                  });      
                                }
                                else
                                if(action == 'share')
                                {
                                  dbfunctions.UpdateTable("posts_comments",{[action]:posts_result[0].share + actionValue},"id='"+rowId+"'",(error,result)=>{
                                    if(error)
                                    {
                                      console.log(error);
                                    }
                                    else
                                    if(result.affectedRows)
                                    {
                                      res.send({"code":1,"description":"sharing action logged"});
                                    }
                                    else
                                    {
                                      res.send({"code":1,"description":"unable to log sharing action"});
                                    }
                                  });
                                }
                              }
                              else
                              {
                                // something need to remove
                                if(action == 'likes')
                                {
                                  //first check if there is like or not if present then delete it 
                                  dbfunctions.AnyDbQuery("select id from posts_comments_likes where user_id='"+userId+"' and posts_comment_id='"+rowId+"'",(error,result)=>{
                                    if(error)
                                    {
                                      console.log(error);
                                    }
                                    else
                                    if(Object.values(JSON.parse(JSON.stringify(result))).length)
                                    {
                                      //there is a like of this post form this user. delete it
                                      dbfunctions.AnyDbQuery("DELETE from posts_comments_likes where id='"+result[0].id+"'",(error,result)=>{
                                        if(error)
                                        {
                                          console.log(error);
                                        }
                                        else
                                        if(result.affectedRows)
                                        {
                                            res.send({"code":1,"description":"like has been deleted for this comment"});
                                        }
                                        else
                                        {
                                          res.send({"code":0,"description":"unable to delete your like on this comment"});
                                        }
                                      }); 
                                    }
                                    else
                                    {
                                      res.send({"code":0,"description":"like not present"});
                                    }
                                  });                    
                                }
                                else
                                if(action == 'dislikes')
                                {
                                  //first check if there is dislike or not if present then delete it 
                                  dbfunctions.AnyDbQuery("select id from posts_comments_dislikes where user_id='"+userId+"' and posts_comment_id='"+rowId+"'",(error,result)=>{
                                    if(error)
                                    {
                                      console.log(error);
                                    }
                                    else
                                    if(Object.values(JSON.parse(JSON.stringify(result))).length)
                                    {
                                      //there is a dislike of this post form this user. delete it
                                      dbfunctions.AnyDbQuery("DELETE from posts_comments_dislikes where id='"+result[0].id+"'",(error,result)=>{
                                        if(error)
                                        {
                                          console.log(error);
                                        }
                                        else
                                        if(result.affectedRows)
                                        {
                                            res.send({"code":1,"description":"your dislike for this comment has been deleted"});
                                        }
                                        else
                                        {
                                          res.send({"code":0,"description":"unable to delete your like on this comment"});
                                        }
                                      }); 
                                    }
                                    else
                                    {
                                      res.send({"code":0,"description":"no dislike present"});
                                    }
                                  });      
                                }
                              }   
                            }
                          });
                        }
                        else
                        {
                          res.send({"code":0,"description":"invalid post id"});
                        }
                      });                      
                    }
                  }
                });
              }break;
            }
          }
        }
      });
    }
    else
    {
      res.send({"code":0,"description":"please login first!"});
    }
  }
  else
  if(req.body.hasOwnProperty('type')&&req.body.hasOwnProperty('id')&&req.body.hasOwnProperty('description'))
  {
    if(req.signedCookies.user)
    {
      var email = req.signedCookies.user;
      dbfunctions.AnyDbQuery("select id from accounts where email='"+email+"'",(error,user_result)=>{
        if(error)
        {
          throw error;
        }
        else
        {
          if(Object.values(JSON.parse(JSON.stringify(user_result))).length)
          {
            const userId = user_result[0].id;
            const id = parseInt(req.body.id); 
            const description = parseInt(req.body.description); 
            var datetime = dbfunctions.DateTime();
            switch(type)
            {
              case 'post':{
                      dbfunctions.AnyDbQuery("select id,thread_id from posts where id='"+id+"'",(error,post_result)=>{
                        if(error)
                        {
                          console.log(error);
                        }
                        else
                        if(Object.values(JSON.parse(JSON.stringify(post_result))).length)
                        {
                          //post is present
                          dbfunctions.InsertDataInTable("posts_comments","id,user_id,post_id,parent_comment,description,shares,likes,dislikes,updated_datetime,created_datetime","'','"+userId+"','"+id+"','0','"+description+"','','','','"+datetime+"','"+datetime+"'",(error,result)=>{
                            if(error)
                            {
                              console.log(error);
                            }
                            else
                            if(result.affectedRows)
                            {
                              res.send({"code":1,"description":"Posted!"});
                            }
                          });
                        }
                        else
                        {
                          res.send({"code":1,"description":"invalid post id"});
                        }
                      });                
              }break;
              case 'comment':{
                  dbfunctions.AnyDbQuery("select id,thread_id from posts where id='"+id+"'",(error,post_result)=>{
                    if(error)
                    {
                      console.log(error);
                    }
                    else
                    if(Object.values(JSON.parse(JSON.stringify(post_result))).length)
                    {
                      //post is present
                      dbfunctions.InsertDataInTable("posts_comments","id,user_id,post_id,parent_comment,description,shares,likes,dislikes,updated_datetime,created_datetime","'','"+userId+"','"+post_result[0].id+"','"+id+"','"+description+"','','','','"+datetime+"','"+datetime+"'",(error,result)=>{
                        if(error)
                        {
                          console.log(error);
                        }
                        else
                        if(result.affectedRows)
                        {
                          res.send({"code":1,"description":"Commented!"});
                        }
                      });
                    }
                    else
                    {
                      res.send({"code":1,"description":"invalid comment id"});
                    }
                  });    
              }break;
            }
          }
        }
      });
    }
    else
    {
      res.send({"code":0,"description":"please login first"});
    }
  }
});

const GetSearchResults = (query,callback)=>{
  var json = [];
  var search_query = "";

  if(query)
  {
    search_query = "select id,title,description,status,posts_count,created_datetime from threads where title LIKE '%"+query+"%' ORDER BY LOCATE('"+query+"',title)";
  }
  else
  {
    search_query = "select id,title,description,status,posts_count,created_datetime from threads order by updated_datetime desc";
  }
  dbfunctions.AnyDbQuery(search_query,(error,result)=>{
    if(error)
    {
      callback(error,null);
    }
    else
    {
      if(Object.values(JSON.parse(JSON.stringify(result))).length)
      {
        JSON.parse(JSON.stringify(result)).forEach((row)=>{
          //get the last post info
          // console.log(row.id);
          dbfunctions.AnyDbQuery("select user_id,title,created_datetime from posts where thread_id='"+row.id+"' order by created_datetime DESC limit 1",(error,post_result)=>{
            if(error)
            {
              callback(error,null);
            }
            else
            {
              if(Object.values(JSON.parse(JSON.stringify(post_result))).length)
              {
                // console.log(JSON.parse(JSON.stringify(post_result)));
                dbfunctions.AnyDbQuery("select username from accounts where id='"+post_result[0].user_id+"'",(error,user_result)=>{
                  if(error)
                  {
                    callback(error,null);
                  }
                  else
                  if(Object.values(JSON.parse(JSON.stringify(user_result))).length)
                  {
                    json.push({"title":row.title,"description":row.description,"status":row.status,"posts_count":row.posts_count,"LastUpdated_datetime":moment(post_result[0].created_datetime).format("DD MMM YYYY"),"LastPost":post_result[0].title,"LastUser":user_result[0].username});
                    // console.log(json);
                    if(json.length == Object.values(JSON.parse(JSON.stringify(result))).length)
                    {                            
                      // console.log(json);
                      callback(null,json);
                    }
                  }
                });                    
              }
            }
          });  
        });                          
      }   
    }
  });
      
};

app.listen(3001, () => {
  console.log("app listening on port 3001")
});