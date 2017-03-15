var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080; //default port 8080

const bodyParser = require("body-parser");
  app.use(bodyParser.urlencoded({extended: true}));
//allows us to access POST request parameters

function generateRandomString() {
  var r = " ";
  var s = "abcdefghijklmnopqrstuvwxyz0123456789";
  for(var i = 0; i < 6; i++) {
    r += s.charAt(Math.floor(Math.random() * s.length));
  }
  return r;
};


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

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post("/urls", (req, res) => {  //corresponds with method=post
  var newShortURL = generateRandomString();
  if(urlDatabase === null) {
    alert("Please Enter a Website");
  } else {
  urlDatabase[newShortURL] = req.body.longURL; //if
  res.redirect(`urls/${newShortURL}`);
    };
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/urls/:id", (req, res) => {

  let templateVars = { shortURL: req.params.id, urls: urlDatabase };
  console.log(req.params.id);
  res.render("urls_show", templateVars)
  });




app.listen(PORT, () => {
  console.log(`${PORT} is the magic port.`);
});



//res.redirect
//