const express = require('express');
const favicon = require('express-favicon');
const path = require('path');
const bodyParser = require('body-parser');
const { redirectToHTTPS } = require('express-http-to-https');
const getVaxAppointments = require('./vaxAppointments');

const port = process.env.PORT || 8080;
const app = express();

app.use(redirectToHTTPS([/localhost:(\d{4})/], [/\/insecure/], 301));
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.use(favicon(path.join(__dirname, 'build', 'favicon.ico')));

// the __dirname is the current directory from where the script is running
app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname, 'build')));
app.use(express.static(path.join(__dirname, 'public', 'fonts')));

app.get('/ping', (req, res) => res.send('pong'));

app.post('/vax', (req, res) => {
  getVaxAppointments().then((result) => res.json(result));
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(port);
