var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080; //default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
//allows us to access POST request parameters

function generateRandomString() {
  var r = "";
  var s = "abcdefghijklmnopqrstuvwxyz0123456789";
  for(var i = 0; i < 6; i++) {
    r += s.charAt(Math.floor(Math.random() * s.length));
  }
  return r;
}


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

//for to retreive GET
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

//creating random string from new url in form POST
app.post("/urls", (req, res) => {
  var newShortURL = generateRandomString();
  urlDatabase[newShortURL] = req.body.longURL; //if
  res.redirect("urls");
});
//%{newShortURL}

//redirecting short urls to longurls
app.get("/u/:shortURL", (req, res) => {
  if(!urlDatabase[req.params.shortURL]) {
    res.status(400).redirect("https://http.cat/404") ;
  } else {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
  }
});

app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id, urls: urlDatabase };
  console.log(req.params.id);
  res.render("urls_show", templateVars); //get req RENDER/post redirects
});
//delete
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

//updating URLS once a submit UPDATE request should modify corresponding
// longURLS and redirect back to /urls
app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect("/urls/" + req.params.id);
});





app.listen(PORT, () => {
  console.log(`${PORT} is the magic port.`);
});



//res.redirect
//