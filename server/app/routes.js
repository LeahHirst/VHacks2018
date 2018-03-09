
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

  // Jobs
  app.get('/jobs', (req, res) => {
    var data = req.body;

    // TODO: Support search radius
    data.latitude = 0;
    data.longitude = 0;
    data.radius = 1000000; // km

    var jobs = require('./jobs.js')(db)
      .getJobsFromLocality(data.latitude, data.longitude, data.radius, (err, jobs) => {
        res.render('view_jobs', { jobs: jobs });
      });
  });

  app.get('/account', (req,res) => {
  	if (!req.user){
  		res.redirect('/login');
  	}

  	res.render('account', { user: req.user });
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
  	res.render('add_funds', { loginError: req.flash('error') });
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

  app.get('/viewjob', (req, res) => {
      db.model.Job.findOne({ _id: req.query.id }, '_id title description deadline location numberRequired contactInfo payment author', function (err, job) {
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

  app.post('/acceptjob', (req, res) => {
      if (req.user == undefined){
        res.redirect('/login');
      } else if (req.user.type == "Requester") {
        res.redirect('/login');
      } else {
        var id = req.query.id;
        console.log("Accepting job id " + id + " by user " + req.user);
        db.model.Job.update({ _id: id }, { worker: req.user }, {}, function (err, affected) {
           if (err) {
               console.log("Error accepting job: " + err);
           } else {
               res.redirect('/yourjobs');
           }
        });
    }
  });

}
