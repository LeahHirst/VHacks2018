
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

    // testing
    data.latitude = 41.9021616;
    data.longitude = 12.4593827;
    data.radius = 10; // km

    var jobs = require('./jobs.js')(db)
      .getJobsFromLocality(data.latitude, data.longitude, data.radius, (err, jobs) => {
        res.render('view_jobs', { jobs: jobs });
      });
  });


  app.get('/account/add_funds', (req,res) => {
  	res.render('add_funds', { loginError: req.flash('error') });
  });

  app.post('/account/add_funds/charge', (req,res) => {
  	  var stripe = require('stripe')('sk_test_yjY74aO0nY2faLr4CiV9kqNz'); // 4242 4242 4242 4242 test credit card
  	  const stripeToken = req.body.stripeToken;
	  const productID = parseInt(req.body.productID);
	  const productAmount = req.body.productAmount;
	  const userID = parseInt(req.user.id);
	  // validate product
	  return routeHelpers.validateProduct(productID, productAmount)
	  .then((product) => {
	    // create charge
	    const charge = {
	      amount: productAmount * 100,
	      currency: product.currency,
	      card: stripeToken
	    };
	    routeHelpers.createCharge(charge, productID, userID);
	  })
	  .then(() => {
	    req.flash('messages', {
	      status: 'success',
	      value: `Thanks for purchasing a ${req.body.productName}!`
	    });
	    res.redirect('/products');
	  })
	  .catch((err) => {
	    return next(err);
	  });
  });

  // Account creation
  app.get('/account/create', (req, res) => {
    res.render('account_create', { error: req.flash('error') })
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
