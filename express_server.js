const cookieSession = require('cookie-session')
const express = require("express");
const bcrypt = require('bcrypt');
const app = express();
const PORT = 8080; 
const bodyParser = require("body-parser");


let urlDatabase = { 
  "test01":{
    id: "tony258",
    url: 'www.google.ca'
  },
  "test02":{
    id: "tony258",
    url: 'www.yahoo.com'
  },
  "test03":{
    id: "tonyx158",
    url:"www.example.com"
  }
}

let users = { 
  "tony258": {
    id:"tony258",
    email: "tonyx258@foxmail.com",
    password: "123"
  }
}

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['key1'],
  maxAge: 24 * 60 * 60 * 1000 
}))

app.use(function(req, res, next){
  let loginUrls = {};
  for (element in urlDatabase){
    if (urlDatabase[element].id === req.session.user_id){
      loginUrls[element]=urlDatabase[element];
    }
  } 
  res.locals.user = users[req.session.user_id];
  res.locals.urls = loginUrls;
  
  next();
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  res.render("urls_index");
});

app.get("/urls/new", (req, res) => {
  if (req.session.user_id){
    res.render("urls_new");
  }else{
    res.redirect("/login");
  }
});

app.get("/login", (req, res) => {
  res.render("user_login");
});

app.get("/urls/:id", (req, res) => {
  if (req.session.user_id){
    if (urlDatabase[req.params.id].id === req.session.user_id){
      let templateVars = { 
        shortURL: req.params.id, 
        longURL: urlDatabase[req.params.id].url,
      };
      res.render("urls_show", templateVars);
    }else{
      res.send("please enter a vaild shortURL");
    }
  }else{
    res.send("please login first");
  }
  
});

app.get("/u/:id", (req, res) => {
  let longU = 'http://'+ urlDatabase[req.params.id].url;
  res.redirect(longU);
});

app.get("/register", (req, res) => {
  res.render("user_registration");
});

app.post("/urls", (req, res) => {
  let shortU = generateRandomString();
  urlDatabase[shortU]={
    id: req.session.user_id,
    url: req.body.longURL
  }
  
  res.redirect("/urls/");      
});

app.post("/urls/:id/delete", (req, res) => {
  let i = req.params.id;
  delete urlDatabase[i];
  
  res.redirect("/urls/");
});

app.post("/urls/:id", (req, res) => {
  if (req.session.user_id){
    urlDatabase[req.params.id].url = req.body.longURL;
    res.redirect("/urls");
  }else{
    redirect("/urls");
  }
          
});

app.post('/logout', function (req, res) {
  req.session = null;
  res.redirect("/urls");
});


app.post("/login", (req, res) => {

  if(!req.body.email || !req.body.password){
  } else {
    let flag = false;
    let foundUser;
    //check it with the database
    for(var key in users){
      if(users[key].email === req.body.email && bcrypt.compareSync(req.body.password,users[key].password)){
        flag = true;
        foundUser = users[key];
      }
    }
    if(flag){
      req.session.user_id = foundUser.id;
      res.redirect("/urls");
      
    } else{
      res.send("please enter the correct userID and pwd")
    }
  }
});

app.post("/register", (req, res) => {
  
  let user_id = generateRandomString();
  let sameEmail = false;
  let hashedPassword = bcrypt.hashSync(req.body.password,10);
  for (let key in users){
    let value = users[key];
    if (value.email === req.body.email){
      sameEmail = true;
    }
  }
  if(req.body.email === "" ||req.body.password === ""){
    res.statusCode = 400;
    res.send("err 400 please enter vaild email and password");
  } else if(sameEmail){
    res.statusCode = 400;
    res.send("err 400 same email is alread registered");
  } else{
    users[user_id] = {
      id: user_id,
      email: req.body.email,
      password: hashedPassword
    }
    req.session.user_id = user_id;
    res.redirect("/urls");
  }
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

function generateRandomString() {
  const list = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','0','1','2','3','4','5','6','7','8','9'];
  let random = "";
  for (let i = 0; i < 6; i++){
    random += list[Math.floor(Math.random() * Math.floor(62))]
  }
  return random;
}
