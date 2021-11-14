// api/server.js

const express = require("express")
const app = express()

// app.get("/", function(req, res) {
//     res.send("It's working!")
//   })

app.listen(3000, () => {
  console.log("app listening on port 3000")
})
app.get("/", function(req, res) {
  res.send({"name": "Jane Doe"}) // Should be json format
})
const cors = require("cors")

app.use(cors())