const express = require("express");
const fs = require("fs");
var bodyParser = require("body-parser");
const path = require('path');
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
    const FilePath = "../public/views/"+req.body.page+".html";
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

app.listen(3001, () => {
  console.log("app listening on port 3001")
})
