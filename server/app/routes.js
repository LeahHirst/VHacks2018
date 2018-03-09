
var howManyJobsShouldASeekerBeAbleToClaim = 5;

module.exports = (app, passport, db) => {

  var jobs = require('./jobs.js')(db);

  app.get('/', (req, res) => {
    if (req.user == undefined) {
      res.redirect('/login')
    } else {
      res.render('index', { user: req.user });
    }
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
    if (req.user == undefined) res.redirect('/login');
    else res.render('add_job', { user: req.user, error: req.flash("error") });
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
    if (req.user == undefined) {
      res.redirect('/login');
      return;
    }

      db.model.Job.findOne({ _id: req.params.id }).populate('author').populate('claimedBy').lean().exec(function (err, job) {
          if (err) {
              console.log(err);
          } else {
            function timeSince(date) {

              var seconds = Math.floor((new Date() - date) / 1000);

              var interval = Math.floor(seconds / 31536000);

              if (interval > 1) {
                return interval + " years";
              }
              interval = Math.floor(seconds / 2592000);
              if (interval > 1) {
                return interval + " months";
              }
              interval = Math.floor(seconds / 86400);
              if (interval > 1) {
                return interval + " days";
              }
              interval = Math.floor(seconds / 3600);
              if (interval > 1) {
                return interval + " hours";
              }
              interval = Math.floor(seconds / 60);
              if (interval > 1) {
                return interval + " minutes";
              }
              return Math.floor(seconds) + " seconds";
            }

            var cSince = timeSince(new Date(job.created));
            res.render('viewjob', { user: req.user, job: job, cSince: cSince });
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
        phoneNumber: data.phoneNumber,
        photo: data.image
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
    if (req.user != undefined && req.user.type == "Requester") {
        var job = db.model.Job({
            title: req.body.title,
            description: req.body.description,
            deadline: req.body.deadline,
            location: {latitude: req.body.latitude, longitude: req.body.longitude},
            numberRequired: req.body.numberRequired,
            contactInfo: req.body.contactInfo,
            payment: req.body.payment,
            author: req.user,
            image: req.body.image
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
    } else {
        console.log("Not logged in as a Requester");
        res.redirect('/login');
    }
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

  app.get('/reward', (req, res) => {
  	if (req.user == undefined) {
      res.redirect('/login');
    } else if (req.user.type == "Requester") {
      res.redirect('/');
    } else{
    	res.render('reward');
    }
  });

}
