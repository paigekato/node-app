const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080; //default port 8080
const cookieSession = require("cookie-session");
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');

app.use(bodyParser.urlencoded({extended: true}));
//allows us to access POST request parameters

app.use(cookieSession({
  name: 'session',
  secret: "secret"
}));

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

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/", (req, res) => {
  if(!users.hasOwnProperty(req.session.user_id)) {
    res.redirect("/login");
  } else {
    res.redirect("/url/new");
  }
});

app.get("/urls/:id", (req, res) => {
  for(var keys in users) {
    if(users.hasOwnProperty(req.session.user_id)) {
      res.status(401).redirect("/error");
    } else {
      let loggedIn = true;
      let authorizedURLS = urlsForUser(req.session.user_id);
      let templateVars = { shortURL: req.params.id, user: req.session.user_id, loggedIn, authorizedURLS };
      res.status(200);
      res.render("urls_show", templateVars);
    }
  }
});

app.get("/urls", (req, res) => {
    let loggedIn = true;
    let authorizedURLS = urlsForUser(req.session.user_id);
    let templateVars = { authorizedURLS, user: req.session.user_id, loggedIn };
    if(!req.session.user_id) {
      res.redirect("/error");
    } else {
      res.status(200);
      res.render("urls_index", templateVars);
    }
});

app.get("/url/new", (req, res) => {
  if(req.session.user_id) {
  let loggedIn = true;
  let templateVars = { user: req.session.user_id, loggedIn };
  res.render("urls_new", templateVars );
  } else {
    res.redirect("/error");
  }
});

app.post("/urls", (req, res) => {
  var newShortURL = generateRandomString();
  if(req.body.longURL === "") {
    res.redirect("/url/new");
  } else {
    urlDatabase[newShortURL] = { id: req.session.user_id, url: req.body.longURL };
    res.redirect("/urls");
  }
});

app.get("/u/:shortURL", (req, res) => {
  let templateVars = { user: req.session.user_id };
  let currentUser = req.session.user_id;
  if(!urlDatabase[req.params.shortURL]) {
    res.status(404).redirect("/error");
  } else if (users[currentUser] != urlDatabase[req.params.shortURL].id) {
      res.status(403).redirect("https://http.cat/403");
    } else {
    let longURL = urlDatabase[req.params.shortURL];
    res.redirect(longURL);
    }
});

app.get("/error", (req, res) => {
  let loggedIn = true;
  let authorizedURLS = urlsForUser(req.session.user_id);
  let templateVars = { authorizedURLS, user: req.session.user_id, loggedIn };
    res.status(200);
    res.render("urls_error", templateVars);
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect("/urls/" + req.params.id);
});

app.get("/login", (req, res) => {
  if(req.session.user_id) {
    res.redirect("/urls/new");
  } else {
    let templateVars = { urls: urlDatabase, user: req.session.user_id };
    res.render("user_login");
  }
});

app.get("/register", (req, res) => {
  let templateVars = { urls: urlDatabase, user: req.session.user_id };
  if(users.hasOwnProperty(req.session.user_id)) {
    res.redirect("/urls");
  } else {
    res.render("usr_register", templateVars);
  }
});

app.post("/register", (req, res) => {
  var userPassword = req.body.password;
  var hashedPassword = bcrypt.hashSync(userPassword, 10);
  if(req.body.email === "" || req.body.password === "") {
    res.status(400).redirect("https://http.cat/400");
  } else {
    var randomID = generateRandomString();
    users[randomID] = { id: randomID, email: req.body.email, password: hashedPassword };
    req.session.user_id = randomID;
    res.redirect("/urls");
  }
});

app.post("/login", (req, res) => {
  if(req.body.email === "" || req.body.password === "") {
    res.status(401).redirect("https://http.cat/401");
  }
  var foundUser = false;
  for(var id in users) {
    let userPassword = req.body.password;
    let hashedPassword = users[id]["password"];
    if(req.body.email === users[id].email && bcrypt.compareSync(userPassword, hashedPassword)) {
      req.session.user_id = id;
      foundUser = true;
    } else {
      res.status(401).redirect("https://http.cat/401");
    }
  }
  if(foundUser) {
    res.status(200);
    res.redirect("/urls");
  } else {
    res.status(403).redirect("https://http.cat/403");
  }
});

app.post("/logout", (req, res) => {
  delete req.session.user_id;
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`${PORT} is the magic port.`);
});
