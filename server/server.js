const express = require("express");
const path = require('path');
const app = express();
const router = express.Router();

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, '../front-end/views/index.html'));
});

// login page
router.get('/login',(req,res) => {
  res.sendFile(path.join(__dirname, '../front-end/views/Loginform.html'));
});

app.listen(3001, () => {
  console.log("app listening on port 3001")
})

module.exports = router;