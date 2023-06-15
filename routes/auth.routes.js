const { Router } = require('express');
const router = new Router();
const User = require('../models/User.model');
const { isLoggedIn, isLoggedOut } = require('../middleware/route-guard.js');

const bcryptjs = require('bcryptjs');
const saltRounds = 10;
 
// signup routes
router.get('/signup', (req, res) => res.render('auth/signup'));

router.post('/signup', (req, res, next) => {
    const { username, password } = req.body
  
    bcryptjs
      .genSalt(saltRounds)
      .then(salt => bcryptjs.hash(password, salt))
      .then(hashedPassword => {
        return User.create({
          username,
          passwordHash: hashedPassword
        });
      })
      .then(newUser => {
        console.log('Newly created user is: ', newUser)
      })
      res.redirect('/')
      .catch(err => next(err))
  })

// login routes 
router.get('/login', (req, res) => res.render('auth/login'))

router.post('/login', (req, res, next) => {
  console.log('SESSION =====> ', req.session)
  const { username, password } = req.body;
  
  if (username === '' || password === '') {
    res.render('auth/login', {
      errorMessage: 'Please enter both, username and password to login.'
    });
    return
  }
 
  User.findOne({ username })
    .then(user => {
      if (!user) {
        res.render('auth/login', { errorMessage: 'Username is not registered. Try with other username.' });
        return;
      } else if (bcryptjs.compareSync(password, user.passwordHash)) {
        req.session.currentUser = user
        res.redirect('/userProfile')
      } else {
        res.render('auth/login', { errorMessage: 'Incorrect password.' });
      }
    })
    .catch(error => next(error));
})

//user routes
router.get('/userProfile', isLoggedIn, (req, res) => {
  res.render('users/user-profile', { userInSession: req.session.currentUser });
})

//main
router.get("/main", (req, res, next) => {
  if(req.session.currentUser){
    res.render("main", {user: req.session.currentUser, loggedIn: true});
  }
  else {
    res.redirect("/")
  }
})

//private
router.get("/private", (req, res, next) => {
  if(req.session.currentUser ){
    res.render("private", {user: req.session.currentUser, loggedIn: true});
  }
  else {
    res.redirect("/")
  }
});

router.post('/logout', (req, res, next) => {
  req.session.destroy(err => {
    if (err) next(err);
    res.redirect('/');
  });
});


  
   

module.exports = router;