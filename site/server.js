
// main.mjs
import * as dbinterface from './dbinterface.js'; // or './module'

let http = require("http");
let fs = require("fs").promises;
var validator = require('validator');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const express = require('express');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const expressjwt = require('express-jwt');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var sqlite = require("sqlite");

let port = 3000;
let root = "public";
let OK = 200, NotFound = 404, BadType = 415, Error = 500;

//
// //SQL test
// var connection = mysql.createConnection({
//   host     : 'localhost',
//   user     : 'nodeserver',
//   password : 'nodeserver1998',
//   database : 'webtech'
// });

const getTokenFromHeaders = (req) => {
  const { headers: { authorization } } = req;

  if (req.cookies.token) {
    return req.cookies.token;
  }

  if(authorization && authorization.split(' ')[0] === 'Token') {
    return authorization.split(' ')[1];
  }
  return null;
};

const auth = {
  required: expressjwt({
    secret: 'secret',
    userProperty: 'payload',
    getToken: getTokenFromHeaders,
  }),
  optional: expressjwt({
    secret: 'secret',
    userProperty: 'payload',
    getToken: getTokenFromHeaders,
    credentialsRequired: false,
  }),
};

function newUser() {
  var id;
  var username;
  var profile_image;
  var name;
  var occupation;
  var occupation_location;
  var hash;
  var salt;

  let setDetails = function(id, username, hash, salt) {
    this.id = id;
    this.username = username;
    this.hash = hash;
    this.salt = salt;
    return true;
  }

  let setNew = function(username, password, profile_image, name, occupation, occupation_location) {
    this.username = username;
    this.profile_image = profile_image;
    this.name = name;
    this.occupation = occupation;
    this.occupation_location = occupation_location;
    this.salt = crypto.randomBytes(16).toString('hex');
    this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
    return true;
  }

  let generateHash = function(password) {
    this.salt = crypto.randomBytes(16).toString('hex');
    this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
    return true;
  }

  let validate = function(password) {
    const hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
    return this.hash === hash;
  }

  let generateToken = function() {
    const today = new Date();
    const expirationDate = new Date(today);
    expirationDate.setDate(today.getDate() + 60);

    return jwt.sign ( {
        username: this.username,
        id: this.id,
        exp: parseInt(expirationDate.getTime() / 1000, 10),
      }, 'secret');
  }

  let getAuthJSON = function() {
    return {
      id: this.id,
      username: this.username,
      token: this.generateToken(),
    }
  }

  return {id, username, profile_image, name, occupation, occupation_location, hash, salt, setDetails, validate, generateToken, getAuthJSON, setNew}

}

async function getAnnouncements(callback) {

  let query = 'SELECT * FROM announcements ORDER BY id DESC'

  try {
    var db = await sqlite.open("./db.sqlite");
    var result = await db.all(query);
    callback(result);
  } catch(e) {
    callback(null);
  }
}

async function createUser(user, success_func, error_func) {

  try {

    let query = "INSERT INTO authentication (username, profile_image, name, occupation, occupation_location, hash, salt) VALUES (?, ?, ?, ?, ?, ?, ?)"
    var db = await sqlite.open("./db.sqlite");
    var result = await db.run(query, [user.username, user.profile_image, user.name, user.occupation, user.occupation_location, user.hash, user.salt]);
    success_func();
  } catch(e) {
    console.log(e);
    error_func();
  }
}

async function getUser(username, whenDone) {

  let query = "SELECT * FROM authentication WHERE username = ?"

  try {
    var db = await sqlite.open("./db.sqlite");
    var result = await db.get(query, [username]);
    if(result == null) {
      return whenDone(null);
    }

    let user = newUser();
    user.setDetails(result.id, result.username, result.hash, result.salt);
    whenDone(user);

  } catch(e) {
    console.log(e);
    whenDone(null);
  }

}

//Routing

const app = express()
app.use(cookieParser())
app.use(bodyParser.urlencoded({
  extended: true,
  limit: '50mb'
}));
app.use(bodyParser.json({
  extended: true,
  limit: '50mb'
}));
app.use(passport.initialize());   // passport initialize middleware
app.use(passport.session());      // passport session middleware

app.use(express.static(__dirname + '/public/static'))

/////////////

passport.use(new LocalStrategy((username, password, done) => {

  getUser(username, (user) => {

    if (!user || !user.validate(password)) {
      done(null, false, { errors: { 'email or password': 'is invalid' } });
    } else {
      done(null, user);
    }

  });

}));

app.get('/login', (req, res) => {
  let root_directory = __dirname + '/' + root + '/';
  res.sendFile(root_directory + 'login.html', root_directory);
})
app.get('/register', (req, res) => {
  let root_directory = __dirname + '/' + root + '/';
  res.sendFile(root_directory + 'register.html', root_directory);
})
app.get('/home', auth.required, (req, res) => {
  let root_directory = __dirname + '/' + root + '/';
  res.sendFile(root_directory + 'home.html', root_directory);
})
app.get('/about', auth.required, (req, res) => {
  let root_directory = __dirname + '/' + root + '/';
  res.sendFile(root_directory + 'about.html', root_directory);
})
app.get('/vote', auth.required, (req, res) => {
  let root_directory = __dirname + '/' + root + '/';
  res.sendFile(root_directory + 'vote.html', root_directory);
})
app.get('/candidate', auth.required, (req, res) => {
  let root_directory = __dirname + '/' + root + '/';
  res.sendFile(root_directory + 'candidate.html', root_directory);
})
app.get('/announcements', auth.required, (req, res) => {
  let root_directory = __dirname + '/' + root + '/';
  res.sendFile(root_directory + 'announcements.html', root_directory);
})

app.get('/admin', auth.required, (req, res) => {
  console.log("userid requrested admin: " + req.payload.id);

  dbinterface.isAdministrator((result) => {

    if(result) {
      let root_directory = __dirname + '/' + root + '/';
      res.sendFile(root_directory + 'admin.html', root_directory);
      return;
    }

    res.send("You are trying to access a restricted section. This request has been recorded, pending investigation.")

  }, req.payload.id);
  
})

app.get('/announcement_data', auth.required, (req, res) => {

  getAnnouncements((announcements) => {

    res.json({
      announcements
    });
  })

})


app.get('/bill_data', auth.required, (req, res) => {


  dbinterface.getBills((bills) => {

    res.json({
      bills
    });
  })

})

app.get('/bill_data/:id', auth.required, (req, res) => {

  dbinterface.getBillData((bill) => {

    res.json({
      bill
    });
  }, req.params.id, req.payload.id)

})

app.get('/candidate_data', auth.required, (req, res) => {

  dbinterface.getCandidateData((candidates) => {

    res.json({
      candidates
    });
  })

})

app.post("/vote_bill", auth.required, (req, res) => {

  try {

    let user_req = req.body;
    let vote_id = user_req.vote_id;
    let for_against = user_req.for_against;

    dbinterface.UserVoteBill(
      () => {
        res.send("success")
      }, req.payload.id, vote_id, for_against
    )

  }catch(err) {
    console.log(err)
  }
})

app.post("/vote_arg", auth.required, (req, res) => {

  try {

    let user_req = req.body;
    let argument_id = user_req.argument_id;
    let toggle = user_req.toggle;

    //
    dbinterface.UserVoteArg(
      () => {
        res.send("success")
      }, req.payload.id, argument_id, toggle
    )

  }catch(err) {
    console.log(err)
  }

})

app.post("/vote_arg_submit", auth.required, (req, res) => {

  try {

    console.log(req.payload);

    dbinterface.UserArgumentSubmit(() => {res.send("submitted")}, req.payload.id, req.body.vote_id, req.body.for_against, req.body.argument)

  }catch(err) {
    console.log(err)
  }

});

app.post('/admin_announcement', auth.required, (req, res) => {

  try {

    dbinterface.isAdministrator((result) => {

      if(result) {
        

        dbinterface.writeAnnouncement(
          () => {res.send("success")}, req.body.html
        )

        return;
      }

      res.send("failed")

    }, req.payload.id);

  } catch (err) {
    console.log(err);
    res.send("failed");
  }

  // res.send("failed");
  
})

app.post('/admin_bill', auth.required, (req, res) => {

  try {

    console.log(req.body)

    dbinterface.isAdministrator((result) => {

      if(result) {

        console.log("is admin")
        

        dbinterface.writeBill(
          () => {res.send("success")}, req.body.title, req.body.summary, req.body.type, req.body.text_link, req.body.bulleted_list, req.body.date
        )

        return;
      }

      res.send("failed")

    }, req.payload.id);

  } catch (err) {
    console.log(err);
    res.send("failed");
  }

  // res.send("failed");
  
})

app.post('/admin_candidate', auth.required, (req, res) => {

  try {

    dbinterface.isAdministrator((result) => {

      if(result) {

        console.log("is admin")
        
        //full_name, location, testimonial, image_profile, image_background

        dbinterface.writeCandidate(
          () => {res.send("success")}, req.body.full_name, req.body.location, req.body.testimonial, req.body.image_profile, req.body.image_background
        )

        return;
      }

      res.send("failed")

    }, req.payload.id);

  } catch (err) {
    console.log(err);
    res.send("failed");
  }

  // res.send("failed");
  
})


app.get('/', function(req,res) {

  let root_directory = __dirname + '/' + root + '/';

  var options = {
    root: root_directory
  }
  res.redirect('/home')
});

app.get('/auth', auth.required, function(req,res) {
  res.send('authenticated');
})

//activate passport validate
app.post('/login', auth.optional, function(req,res,next) {
  let user_req = req.body;

  if(!user_req.username) {
    return res.status(422).json({
      errors: {
        email: 'is required',
      },
    });
  }

  if(!user_req.password) {
    return res.status(422).json({
      errors: {
        password: 'is required',
      },
    });
  }


  passport.authenticate('local', { session: false }, (err, passportUser, info) => {


    if(err) {
      console.log(err)
      return next(err);
    }


    if(passportUser) {


      const user = passportUser;
      user.token = passportUser.generateToken();
      res.json({
        status: 'ok',
        user: user.getAuthJSON()
      });
      return;
    }

    res.json({
      status: 'failed',
    });

  })(req, res, next);

});

//register, add user to database
app.post('/register', auth.optional, function(req,res) {

  try {

    let ok = {
      status:'ok'
    }

    if(req.body.profile_image == undefined) {
      return res.json({
        error: 'profile image is missing',
        status: 'failed'
      });
    }

    console.log(req.body.profile_image.length);
    let image_data = req.body.profile_image.split(",")[1];

    //Should change this path
    let file_data = Buffer.from(image_data, 'base64');

    let image_name = "profile_image-" + (new Date().toISOString()) + "-" + Math.floor(Math.random() * 100000) + ".png";
    let path = "public/static/img/profile/"+ image_name;
    let refpath = "/img/profile/" + image_name;
    fs.writeFile(path, file_data, (err) => {
      if(err){
        return res.json({
          error: 'profile image failed to upload',
          status: 'failed'
        });
      }
    });

    let user_req = req.body;
    const user = newUser();
    user.setNew(user_req.username, user_req.password, refpath, req.body.name, req.body.occupation, req.body.occupation_location)

    if(!user_req.name) {
      return res.json({
          error: 'name is missing',
          status: 'failed'
      });
    }

    if(!user_req.occupation) {
      return res.json({
          error: 'occupation is missing',
          status: 'failed'
      });
    }

    if(!user_req.occupation_location) {
      return res.json({
          error: 'occupation location is missing',
          status: 'failed'
      });
    }

    if(!user_req.username || !validator.isEmail(user_req.username)) {
      return res.json({
        error: 'email is invalid',
        status: 'failed'
      });
    }

    if(!user_req.password) {
      return res.json({
          error: 'password is missing',
          status: 'failed'
      });
    }

    createUser(user, () => res.json(ok), () => res.json({
      error: 'account already exists',
      status: 'failed'
    }))

  }catch(err) {
    console.log(err);
  }
})

//Not euthenticated error
app.use(function(err, req, res, next) {
  if(401 == err.status) {
    res.redirect('/login')
  }
});

app.listen(port, 'localhost', () => console.log(`Listening on port ${port}!`))
