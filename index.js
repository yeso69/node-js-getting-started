const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000

var app = express();

var cookieParser = require('cookie-parser');

app.use(cookieParser())
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs');


var routing = require('./routing.js')(app);

app.listen(PORT, () => console.log(`Listening on ${ PORT }`));
