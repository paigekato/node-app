var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080; //default port 8080

app.set("view engine", "ejs");

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://wwww.google.com"
};

app.get("/", (request, response) => {
  response.end("HELLO PEASANTS!");
});

app.get("/urls.json", (request, response) => {
  response.json(urlDatabase);
});

app.get("/urls", (request, response) => {
let templateVars = {urls: urlDatabase};
  response.render("urls_index", templateVars);
});

app.listen(PORT, () => {
  console.log(`${PORT} is the magic port.`);
});