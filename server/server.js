const express = require("express");
const fs = require("fs");
var bodyParser = require("body-parser");
const path = require('path');
const { log } = require("console");
const app = express();

app.use(bodyParser.urlencoded({extended: false}));

app.use('/css',express.static(path.join(__dirname,'../public/assets/css')));
app.use('/js',express.static(path.join(__dirname,'../public/assets/js')));
app.use('/images',express.static(path.join(__dirname,'../public/assets/images')));
app.use('/favicon',express.static(path.join(__dirname,'../public/assets/favicon')));
app.use('/views',express.static(path.join(__dirname,'../public/views')));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, '../public/views/frame.html'));
});

// login page
app.get('/login',(req,res) => {
  res.sendFile(path.join(__dirname, '../public/views/Loginform.html'));
});

function PageNotFoundData(){
  const pageNotfound = "../public/views/page-not-found.html";
  if(fs.existsSync(path.join(__dirname, pageNotfound)))
  {
    fs.readFile(path.join(__dirname, pageNotfound),{encoding:'utf8',flag:'r'},(error,data) => {
      if(error){
        return "Page Not Found";
      }
      else
      {
        return data;
      }
    })
  }else{
    return "Page Not Found";
  }
  
}

app.post('/fetch-page',(req,res)=>{
  //read request file if available and send its content as a result
  const home = ['/','index','home'];
  if(home.indexOf(req.body.page) == -1)
  {
    const FilePath = "../public/views/"+req.body.page+".html";
    if(fs.existsSync(path.join(__dirname, FilePath)))
    {
          data = fs.readFile(path.join(__dirname, FilePath),{encoding:'utf8',flag:'r'}, (error,data) => {
          if(error){
            res.send(PageNotFoundData());
          }
          else{
            res.send(data);
          }
        });
    }
    else{    
      console.log('does not exists!!');
      res.send(PageNotFoundData());
    }
  }
  else
  {
    res.redirect('/');
  }
  
  
});

app.listen(3001, () => {
  console.log("app listening on port 3001")
})
