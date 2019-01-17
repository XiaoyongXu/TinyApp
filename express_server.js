var express = require("express");
var cookieParser = require('cookie-parser')
var app = express();
var PORT = 8080; // default port 8080

app.use(cookieParser())
app.set("view engine", "ejs")

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

let users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/hello", (req, res) => {
  let templateVars = {
    username: req.cookies["username"],
    // ... any other vars
  };
  res.render("urls_index", templateVars);
});

app.get("/urls", (req, res) => {
  let templateVars = { 
    urls: urlDatabase,
    username: req.cookies["username"]
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = { 
    urls: urlDatabase,
    username: req.cookies["username"]
  };
  res.render("urls_new",templateVars);
});

app.get("/urls/:id", (req, res) => {
  let templateVars = { 
    shortURL: req.params.id, 
    longURL: urlDatabase[req.params.id],
    username: req.cookies["username"]
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params]!==undefined){
    let longURL = urlDatabase[req.params.shortURL];
    // console.log(longURL, req.params);

    res.redirect(longURL);
  }else{
    res.send('not vaild');
  }
  
});

app.get("/register", (req, res) => {
  let templateVars = {
    username: req.cookies["username"],
    // ... any other vars
  };
  res.render("user_registration", templateVars);
});

app.post("/urls", (req, res) => {
  // console.log(req.body.longURL);  // debug statement to see POST parameters
  var string = generateRandomString();
  urlDatabase[string] = req.body.longURL; 
  res.redirect("/urls/"+string);        // Respond with 'Ok' (we will replace this)
});

app.post("/urls/:id/delete", (req, res) => {
  let i = req.params.id;
  console.log(i);
  delete urlDatabase[i];
  res.redirect("/urls/");         // Respond with 'Ok' (we will replace this)
});

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect("/urls");        
});

app.post('/login', function (req, res) {
  res.cookie('username', req.body.username);
  res.redirect("/urls");
});

app.post('/logout', function (req, res) {
  res.clearCookie('username');
  res.redirect("/urls");
});

app.post("/register", (req, res) => {
  let templateVars = {
    username: req.cookies["username"],
  };
  let user_id = generateRandomString();
  let sameEmail = false;
  for (element in users){
    if (element.email === req.body.email){
      sameEmail = ture;
    }
  }
  if(req.body.email === "" ||req.body.password === ""){
    res.statusCode = 400;
    res.send("error 400");
  } else if(req.body.email){
    res.statusCode = 400;
    res.send("error 400");
  } else{
    users[user_id] ={
      id: user_id,
      email: req.body.email,
      password: req.body.password
  }
    console.log(users);
    res.cookie('user_id',generateRandomString());
    res.redirect("/urls");
  }
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

function generateRandomString() {
  const list = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','0','1','2','3','4','5','6','7','8','9'];
  let random ="";
  for (let i = 0; i < 6; i++){
    random += list[Math.floor(Math.random() * Math.floor(62))]
  }
  return random;
}
