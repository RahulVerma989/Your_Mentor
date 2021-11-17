const express = require("express")
const app = express()
const router = express.Router();

app.get("/", function(req, res) {
    res.send("It's working!")
  })

// login page
router.get('/login',(req,res)=>res.send('Login'));

app.listen(3001, () => {
  console.log("app listening on port 3001")
})
// app.get("/", function(req, res) {
//   res.send({"name": "Jane Doe"}) // Should be json format
// })

const cors = require("cors")

app.use(cors())

module.exports = router;