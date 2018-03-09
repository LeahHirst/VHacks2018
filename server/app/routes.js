module.exports = (app, passport, db) => {

  app.get('/', (req, res) => {
    res.render('index.html');
  });

  app.get('/login', (req, res) => {
    res.render('login', { loginError: req.flash("error") });
  });

  app.post('/login', passport.authenticate('local', {
    successRedirect: '/',
		failureRedirect: '/login',
		failureFlash: 'Invalid username or password.'
  }));

}
