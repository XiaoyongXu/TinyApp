var express = require("express");
var cookieParser = require('cookie-parser')
const bcrypt = require('bcrypt');
var app = express();
var PORT = 8080; // default port 8080

app.use(cookieParser())
app.set("view engine", "ejs")

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));


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

// function urlsForUser(userId){
//   let urlsForUser = {};
//   for (element in urlDatabase){
//     if (urlDatabase[element].id === userID){
//       urlsForUser[element] = urlDatabase[element];
//     }
//   }
//   return urlsForUser;
// }


app.use(function(req, res, next){
  let loginUrls = {};
  for (element in urlDatabase){
    if (urlDatabase[element].id === req.cookies["user_id"]){
      loginUrls[element]=urlDatabase[element];
    }
  } 
  res.locals.user = users[req.cookies["user_id"]];
  res.locals.urls = loginUrls;
  
  next();
});

let users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "123"
  },
  "tony258": {
    id:"tony258",
    email: "tonyx258@foxmail.com",
    password: "123"
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
  res.render("urls_index");
});

app.get("/urls", (req, res) => {
  res.render("urls_index");
});

app.get("/urls/new", (req, res) => {
  if (req.cookies.user_id){
    res.render("urls_new");
  }else{
    res.redirect("/login");
  }
});

app.get("/login", (req, res) => {
  res.render("user_login");
});




app.get("/urls/:id", (req, res) => {
  if (req.cookies.user_id){
    if (urlDatabase[req.params.id].id === req.cookies.user_id){
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
    id: req.cookies.user_id,
    url: req.body.longURL
  }
  
  res.redirect("/urls/" + shortU);        // Respond with 'Ok' (we will replace this)
});

app.post("/urls/:id/delete", (req, res) => {
  let i = req.params.id;
  delete urlDatabase[i];
  
  res.redirect("/urls/");         // Respond with 'Ok' (we will replace this)
});

app.post("/urls/:id", (req, res) => {
  if (req.cookies.user_id){
    urlDatabase[req.params.id].url = req.body.longURL;
    res.redirect("/urls");
  }else{
    redirect("/urls");
  }
          
});

app.post('/logout', function (req, res) {
  res.clearCookie('user_id');
  res.redirect("/urls");
});


app.post("/login", (req, res) => {

  if(!req.body.email || !req.body.password){
  } else {
    let flag = false;
    let foundUser;
    //check it with the database
    for(var key in users){
        if(users[key].email===req.body.email && bcrypt.compareSync(users[key].password,req.body.password)){
          flag = true;
          foundUser = users[key];
          
        }
    }
    if(flag){
      res.cookie("user_id",foundUser.id)
      res.redirect("/urls");
      
    } else{
      res.send("please enter the correct userID and pwd")
    }
    //checking of the username and password from db ends here.
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
    res.send("err 400");
  } else if(sameEmail){
    res.statusCode = 400;
    res.send("err 400");
  } else{
    users[user_id] ={
      id: user_id,
      email: req.body.email,
      password: hashedPassword
    }
    res.cookie('user_id',user_id);
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
