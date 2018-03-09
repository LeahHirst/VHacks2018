const express  = require('express');
const app      = express();
const mongoose = require('mongoose');
//const passport = reuqire('passport');

var db = require('./app/database.js')(mongoose);

app.use(express.static('public'));



app.listen(3000, () => { console.log('Listening on 3000'); });
