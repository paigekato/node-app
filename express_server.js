const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080; //default port 8080
const cookieSession = require("cookie-session");
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');

//---MIDDLEWARE ---------

app.use(bodyParser.urlencoded({extended: true}));
//allows us to access POST request parameters

app.use(cookieSession({
  name: 'session',
  secret: "secret"
}));

app.set("view engine", "ejs");


/// ------DATABASES -----

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

// --------- FUNCTIONS --------

//for generating random userID and shortURL
function generateRandomString() {
  var r = "";
  var s = "abcdefghijklmnopqrstuvwxyz0123456789";
  for(var i = 0; i < 6; i++) {
    r += s.charAt(Math.floor(Math.random() * s.length));
  }
  return r;
}


//used for finding unique URLS for user

function urlsForUser(id) {
  var userURLS = {};
  for(var shortURLS in urlDatabase) {
    if(urlDatabase[shortURLS].id === id) {
      userURLS[shortURLS] = urlDatabase[shortURLS];
    }
  }
  return userURLS;
}

// -----------LOGIN ----------

//homepage redirects to login or to create a new shortURL
app.get("/", (req, res) => {
  res.redirect("/login");
});

//register a user
app.get("/register", (req, res) => {
  if(users.hasOwnProperty(req.session.user_id)) {
    res.redirect("/urls");
  } else {
    let templateVars = {
      urls: urlDatabase,
      user: req.session.user_id
    };
    res.render("usr_register", templateVars);
  }
});

//loads login page if user is already signed in redirects to create new URL
app.get("/login", (req, res) => {
  if(req.session.user_id) {
    res.redirect("/urls/new");
  } else {
    let templateVars = {
      urls: urlDatabase,
      user: req.session.user_id
    };
    res.render("user_login");
  }
});

//checks database to see if user exists and
//checks password in bcrypt to confirm correct pass
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

//resgisters user and assigns unique ID
app.post("/register", (req, res) => {
  var userPassword = req.body.password;
  var hashedPassword = bcrypt.hashSync(userPassword, 10);
  if(req.body.email === "" || req.body.password === "") {
    res.status(400).redirect("https://http.cat/400");
  } else {
    var randomID = generateRandomString();
    users[randomID] = {
      id: randomID,
      email: req.body.email,
      password: hashedPassword
    };
    req.session.user_id = randomID;
    res.redirect("/urls");
  }
});
//--------ADD URLZ---------

//renders newURL if user is logged in
app.get("/url/new", (req, res) => {
  if(req.session.user_id === undefined) {
    res.redirect("/error");
  } else {
    let loggedIn = true;
    let templateVars = {
      user: req.session.user_id,
      loggedIn
    };
    res.render("urls_new", templateVars );
  }
});

//loads url page
app.get("/urls", (req, res) => {
      let loggedIn = true;
      let authorizedURLS = urlsForUser(req.session.user_id);
      let templateVars = {
        urlDatabase,
        authorizedURLS,
        user: req.session.user_id,
        loggedIn
      };
      res.status(200);
      res.render("urls_index", templateVars);
});

//creates new tinyURL
app.post("/urls", (req, res) => {
  var newShortURL = generateRandomString();
  if(req.body.longURL === "") {
    res.redirect("/url/new");
  } else {
    urlDatabase[newShortURL] = {
      id: req.session.user_id,
      url: req.body.longURL
    };
    res.redirect("/urls");
  }
});

//shows user URLS
app.get("/urls/:id", (req, res) => {
if(req.session.user_id) {
  let loggedIn = true;
  let authorizedURLS = urlsForUser(req.session.user_id);
  let templateVars = {
    shortURL: req.params.id,
    user: req.session.user_id,
    email: users[req.session.user_id],
    loggedIn,
    authorizedURLS
  };
  res.render("urls_show", templateVars);
} else {
    res.status(401).redirect("/urls");
  }
});

//redirects shortURL to long URL
app.get("/u/:shortURL", (req, res) => {
  let templateVars = { user: req.session.user_id };
  let currentUser = req.session.user_id;
  let longURL = urlDatabase[req.params.shortURL].url;
  res.redirect(longURL);
});

//post request for delete of URL
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

//updates URL -----------------
app.post("/urls/:id", (req, res) => {
  if(req.session.user_id) {
    urlDatabase[req.session.id] = req.body.longURL;
  res.redirect("/urls");
  } else {
    res.status(401).reditect("/error");
  }
});

//---------------------------
//redirects to error page
app.get("/error", (req, res) => {
  let loggedIn = true;
  let authorizedURLS = urlsForUser(req.session.user_id);
  let templateVars = {
    authorizedURLS,
    user: req.session.user_id,
    loggedIn
  };
    res.status(200);
    res.render("urls_error", templateVars);
});

//--------LOGOUT---------
app.post("/logout", (req, res) => {
  delete req.session.user_id;
  res.redirect("/");
});

//------ PORT --------
app.listen(PORT, () => {
  console.log(`${PORT} is the magic port.`);
});
