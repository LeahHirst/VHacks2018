module.exports = (app, passport, db) => {

  app.get('/', (req, res) => {
    res.send('Hello world!');
  });

}
