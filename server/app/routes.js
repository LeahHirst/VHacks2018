module.exports = (app, passport, db) => {

  app.get('/', (req, res) => {
    res.render('index.html');
  });

  app.get('/login', (req, res) => {
    res.render('login', { loginError: req.flash('error') });
  });

  app.post('/login', passport.authenticate('local', {
    successRedirect: '/',
		failureRedirect: '/login',
		failureFlash: 'Invalid username or password.'
  }));

  app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/login');
  })

  // Jobs
  app.get('/jobs', (req, res) => {

  });

  // Account creation
  app.get('/account/create', (req, res) => {
    res.render('account_create', { error: req.flash('error') })
  })

  app.post('/account/create', (req, res) => {
    // TODO: Validation

    var data = req.body;

    require('./password.js').generateHash(data.password, (err, hash) => {
      if (err) {
        req.flash('error', err);
        res.redirect('/account/create');
        return;
      }
      var user = new db.model.User({
        email: data.email,
        password: hash,
        type: data.usertype,
        name: data.name,
        phoneNumber: data.phone
      });
      user.save(err => {
        if (err) {
          req.flash('error', err);
          res.redirect('/account/create');
          return;
        }
        // Redirect to home
        res.redirect('/')
      });
    });
  })

}
