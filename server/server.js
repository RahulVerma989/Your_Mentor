const express = require("express");
const path = require('path');
const app = express();
app.use('/css',express.static(path.join(__dirname,'../public/assets/css')));
app.use('/js',express.static(path.join(__dirname,'../public/assets/js')));
app.use('/images',express.static(path.join(__dirname,'../public/assets/images')));
app.use('/views',express.static(path.join(__dirname,'../public/views')));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, '../public/views/index.html'));
});

// login page
app.get('/login',(req,res) => {
  res.sendFile(path.join(__dirname, '../public/views/Loginform.html'));
});

app.listen(3001, () => {
  console.log("app listening on port 3001")
})
