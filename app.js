//jshint esversion:6

const express = require("express");
const ejs = require("ejs");
const SocketServer = require('ws').Server;
// const bodyParser = require("body-parser");

const app = express();
app.set('view engine', 'ejs');
// app.use(bodyParser.urlencoded({
//   extended: true
// }));
app.use(express.static("public"));

app.get("/", function(req,res) {
  res.render("home");
});

app.post("/", function(req,res) {
  res.render("home");
});

app.listen(process.env.PORT || 3000, function() {
  console.log("Server started on port 3000");
});
