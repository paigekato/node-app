var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080; //default port 8080
var cookieParser = require('cookie-parser');
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
app.use(cookieParser());

var urlDatabase = {
  "b2xVn2": {
    id: "123abc",
    url: "http://www.lighthouselabs.ca"
  },
  "9sm5xK": {
    id: "345def",
    url: "http://wwww.google.com"
  }
};

function urlsForUser(id) {
  var userURLS = {};
  for(shortURLS in urlDatabase) {
    if(urlDatabase[shortURLS]["id"] === id) {
      userURLS[shortURLS] = urlDatabase[shortURLS];
    }
  }
  return userURLS;
}

var users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple"
  }
};

app.get("/", (req, res) => {
  res.redirect("/url/new");
});

app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id, urls: urlDatabase, user: users[req.cookies["user_id"]]};
  res.render("urls_show", templateVars); //get req RENDER/post redirects
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  var loggedIn = false;
  for(var id in users) {
    if(req.cookies["user_id"] === users[id].id) {
      loggedIn = true;
    }
  }
  let authorizedURLS = urlsForUser(req.cookies["user_id"]);
  let templateVars = { authorizedURLS, user: users[req.cookies["user_id"]], loggedIn };
  if(loggedIn) {
    res.render("urls_index", templateVars);
  } else {
    res.render("urls_index", templateVars);
  }
});//info from files in view

//for to retreive GET
app.get("/url/new", (req, res) => {
  let templateVars = { user: users[req.cookies["user_id"]] };
  var loggedIn = false;
  for(var id in users) {
    if(req.cookies["user_id"] === users[id].id) {
      loggedIn = true;
    }
  }
  if(loggedIn) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

//creating random string from new url in form POST
app.post("/urls", (req, res) => {
  var newShortURL = generateRandomString();
  if(req.body.longURL === "") {
    res.redirect("/url/new");
  } else {
      // var ownUserURLS =  urlsForUser(users[id].id);
    urlDatabase[newShortURL] = { id: req.cookies["user_id"], url: req.body.longURL };
    res.redirect("urls");
  }
});
//%{newShortURL

//redirecting short urls to longurls
app.get("/u/:shortURL", (req, res) => {
  let templateVars = { user: users[res.cookie("user_id")] };
  if(!urlDatabase[req.params.shortURL]) {
    res.status(400).redirect("https://http.cat/404");
  } else {
    let longURL = urlDatabase[req.params.shortURL];
    res.redirect(longURL);
  }
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

//for login info COOKIES
app.get("/login", (req, res) => {
  let templateVars = { urls: urlDatabase, user: users[req.cookies["user_id"]] };
  res.render("user_login", templateVars);
});

app.post("/login", (req, res) => {
  if(req.body.email === "" || req.body.password === "") {
    res.status(400).redirect("https://http.cat/404");
  }
  var foundUser = false;
  for(var id in users) {
    if(req.body.email === users[id].email && req.body.password === users[id].password) {
      res.cookie("user_id", users[id].id);
      foundUser = true;
    }
  }
  if(foundUser) {
    res.redirect("/urls");
  } else {
    res.status(403).redirect("https://http.cat/403");
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

//renders user_reg
app.get("/register", (req, res) => {
  let templateVars = { urls: urlDatabase, user: users[req.cookies["user_id"]] };
  res.render("usr_register", templateVars);
});

// //posting form info register information
app.post("/register", (req, res) => {
  if(req.body.email === "" || req.body.password === "") {
    res.status(400).redirect("https://http.cat/404");
  } else {
    var randomID = generateRandomString();
    users[randomID] = { id: randomID, email: req.body.email, password: req.body.password };
    res.cookie("user_id", randomID);
    res.redirect("/urls"); //change?
  }
});




app.listen(PORT, () => {
  console.log(`${PORT} is the magic port.`);
});
