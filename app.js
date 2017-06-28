var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fs = require("fs");
//var multer = require("multer");


var sample = require('./sample');

var index = require('./routes/index');

var onboard = require('./routes/onboard');

	var app = express();


	//app.use(express.static(__dirname + '/public'));        
    app.use(express.static(path.join(__dirname, 'public'))); 

	// configure app to use bodyParser()
	// this will let us get the data from a POST
	app.use(bodyParser.urlencoded({ extended: true }));
	app.use(bodyParser.json({ 'type': '*/*',limit: '20mb' }));

	//create a cors middleware
	app.use(function(req, res, next) {
	//set headers to allow cross origin request.
	    res.header("Access-Control-Allow-Origin", "*");
	    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
	    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	    next();
	});



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  //var err = new Error('Not Found');
  //console.log('404 ')
  //err.status = 404;
  console.log('Something is happening.');

  next();
});

// error handler

app.use(function(err, req, res, next) {
	console.log('ERROR GENERAL')
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
   res.json({'error ':err.message});

});

	app.use('/', index);
	app.use('/api', onboard);
	



   // listen (start app with node server.js) ======================================
	var port = process.env.PORT || 8080;
	var server = app.listen(port, function () {
        console.log('Server running at http://0.0.0.0:' + port + '/');
    });

    //app.listen(8080);
    //console.log("App listening on port 8080");


module.exports = app;
