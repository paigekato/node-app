var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080; //default port 8080

app.set("view engine", "ejs");

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://wwww.google.com"
};

app.get("/", (req, res) => {
  res.end("HELLO PEASANTS!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});//info from files in view

app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: require.params.id, urls: urlDatabase };
  res.render("urls_show", templateVars)
  });


app.listen(PORT, () => {
  console.log(`${PORT} is the magic port.`);
});