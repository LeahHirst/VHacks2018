module.exports = (app, passport, db) => {

  app.get('/', (req, res) => {
    res.render('index.html');
  });

  app.get('/login', (req, res) => {
    res.render('login', { loginError: req.flash('error') });
  });

  app.get('/createjob', (req, res) => {
    res.render('createjob', { error: req.flash("error") });
  });

  app.get('/jobcreationconfirmation', (req, res) => {
      res.render('jobcreationconfirmation', {});
  })

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
  });

  app.get('/viewjob', (req, res) => {
      db.model.Job.findOne({ _id: req.query.id }, 'title description deadline location numberRequired contactInfo payment author', function (err, job) {
          if (err) {
              console.log(err);
              return
          } else {
              console.log(job);
              res.render('viewjob', { job: job })
          }
      });
  });

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

  app.post('/createjob', (req, res) => {
    var job = db.model.Job({
        title: req.body.title,
        description: req.body.description,
        deadline: req.body.deadline,
        location: {latitude: req.body.latitude, longitude: req.body.longitude},
        numberRequired: req.body.numberRequired,
        contactInfo: req.body.contactInfo,
        payment: req.body.payment,
        author: req.user
    });
    job.save(function (error) {
        if (error) {
            console.log(error);
            req.flash("error", "Validation error, make sure to fill all fields correctly");
            res.redirect('/createjob');
        } else {
            res.redirect('/jobcreationconfirmation');
        }
    });
});

}
