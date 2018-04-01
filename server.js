//Code by Walter Cheng

//loading necessary modules and setting up constant value
const ipAddress = "localhost";    //for testing in localhost
const PORT = 5000;

const pug = require('pug');
const express = require('express');
const app = express();

app.use(express.static(__dirname + '/public'));
app.set('view engine', 'pug');

app.get('*', function(req, res, next){
	next();
})

app.get('/', function(req, res){
	res.render('index', {});
});

app.listen(PORT, ipAddress, function(err){
	if (err)
		console.log(err);
	else
		console.log('Server started');
});	