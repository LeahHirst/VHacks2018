
var howManyJobsShouldASeekerBeAbleToClaim = 5;

module.exports = (app, passport, db) => {

  var jobs = require('./jobs.js')(db);

  app.get('/', (req, res) => {
    res.render('view_jobs', {});
  });

  app.get('/login', (req, res) => {
  	if (req.user){
  		return res.redirect('/account');
  	} else {
    	res.render('login', { loginError: req.flash('error') });
    }
  });

  app.get('/logout', (req, res) => {
      req.logout();
      res.redirect('/login');
  });

  app.get('/job/create', (req, res) => {
    res.render('createjob', { error: req.flash("error") });
  });

  app.get('/job/create/confirmation', (req, res) => {
      res.render('jobcreationconfirmation', {});
  })

  app.post('/job/list', (req, res) => {
      var data = req.body;
      jobs.getJobsFromLocality(data.latitude, data.longitude, data.radius, (err, jobs) => {
          if (err) {
              console.log(err);
          } else {
              res.send(jobs);
          }
        });
  });

  app.post('/login', passport.authenticate('local', {
    successRedirect: '/',
		failureRedirect: '/login',
		failureFlash: 'Invalid username or password.'
  }));

  // Jobs
  app.get('/jobs', (req, res) => {
    var data = req.body;

    // TODO: Support search radius
    data.latitude = 0;
    data.longitude = 0;
    data.radius = 1000000; // km

    jobs.getJobsFromLocality(data.latitude, data.longitude, data.radius, (err, jobs) => {
        res.render('view_jobs', { jobs: jobs });
      });
  });

  app.get('/account', (req,res) => {
  	if (!req.user){
  		res.redirect('/login');
  	} else {
  		res.render('account', { user: req.user });
  	}
  	// if (req.user.type == 'Requester'){

  	// 	// render bio and past given jobs
  	// } else { // seeker

  	// 	// render seeker page with past completed jobs
  	// }

  });

  app.get('/account/add_funds', (req,res) => {
  	if (!req.user){
  		res.redirect('/login');
  	}
  	else{
  		res.render('add_funds', { loginError: req.flash('error') });
  	}
  });

  app.post('/account/charge', (req,res) => {
  	  var stripe = require('stripe')('sk_test_yjY74aO0nY2faLr4CiV9kqNz'); // 4242 4242 4242 4242 test credit card
  	  const stripeToken = req.body.stripeToken;
  	  var charge_amt = parseFloat(req.body.amount);

	  // create charge
	  const charge = {
	    amount: charge_amt * 100.0, // convert to cents!
	    currency: 'eur',
	    card: stripeToken
	  };
	  stripe.charges.create(charge, (err, res) => {
	    if (err) {
	    	console.log(err);
	    	return;
	    }

	    // Update database by logged in user to reflect additional credit
	    req.user.balance += charge_amt;
	    req.user.save();
	  })
	  .then(() => {
	    req.flash('messages', {
	      status: 'success',
	      value: `Thanks for adding money into your account!`
	    });
	    res.redirect('/');
	  })
	  .catch((err) => {
	    return next(err);
	  });
  });

  // Account creation
  app.get('/account/create', (req, res) => {
    res.render('account_create', { error: req.flash('error') })
  });

  app.get('/job/:id', (req, res) => {
      db.model.Job.findOne({ _id: req.params.id }, '_id title description deadline location numberRequired contactInfo payment author', function (err, job) {
          if (err) {
              console.log(err);
              return
          } else {
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
        phoneNumber: data.phoneNumber
      });
      user.save(err => {
        if (err) {
            console.log(err);
          req.flash('error', err);
          res.redirect('/account/create');
          return;
        }
        // Redirect to home
        res.redirect('/')
      });
    });
  })

  app.post('/job/create', (req, res) => {
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
    job.save(
      function (error) {
          if (error) {
              console.log(error);
              req.flash("error", "Validation error, make sure to fill all fields correctly");
              res.redirect('/job/create');
          } else {
              res.redirect('/job/create/confirmation');
          }
      });
  });

  app.post('/job/claim', (req, res) => {
      if (req.user == undefined){
        res.redirect('/login');
      } else if (req.user.type == "Requester") {
        res.redirect('/login');
      } else {
        var id = req.body.id;
        console.log("Accepting job id " + id + " by user " + req.user);
        db.model.Job.update({ _id: id }, { $push: { claimedBy: req.user._id } }, function (err, affected) {
           if (err) {
               console.log("Error accepting job: " + err);
           } else {
               res.redirect('/myjobs');
           }
        });
    }
  });

  app.get('/myjobs', (req, res) => {
    if (req.user == undefined) {
      res.redirect('/login');
    } else if (req.user.type == "Requester") {
      // Get jobs created by user
      db.model.Job.find({
        author: req.user._id
      }, (err, jobs) => {
        if (err) {
          console.log(err);
          res.send('Error');
        } else {
          res.render('created_jobs', { jobs: jobs });
        }
      });
    } else if (req.user.type == "Seeker") {
      // Get jobs assigned to user
      db.model.Job.find({
        claimedBy: req.user._id
      }, (err, jobs) => {
        if (err) {
          console.log(err);
          res.send('Error');
        } else {
          res.render('claimed_jobs', { jobs: jobs });
        }
      });
    }
  });

}
