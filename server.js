var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var _ = require('underscore');
var path = require("path");

var mongojs = require('mongojs');


// Here we find an appropriate database to connect to, defaulting to
// localhost if we don't find one.  
var MONGOCONNECTION = process.env.MONGODB_URI || 'mongodb://localhost:27017/bld';
var db = mongojs(MONGOCONNECTION);
// // CHANGE THE NAME OF THE DATABASE!!!
var PROJECTDB = db.collection('breakfast-lunch-dinner');


app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 
// app.use(express.json());       // to support JSON-encoded bodies
// app.use(express.urlencoded()); // to support URL-encoded bodies

function mongoError(res, err) {
    if (err) console.error('mongo error ->', err);
    return res.status(500).send('internal server error')
};

function findAll(collection, query, res) {
  collection.find(
    query, function(err, docs) {
      if (err) { return mongoError(res, err); };
      // if nothing is found (doc === null) return empty array
      console.log(docs)
      res.send(docs === null ? [] : docs);
    }
  );
};

app.use('/', express.static('static'));


// make sure to change the name of the db
app.get('/', function(req, res) {
    // return everything in the DB
    res.send("Hello there!")
});



// make sure to change the name of the db
app.get('/api/activities', function(req, res) {
    // return everything in the DB
    findAll(PROJECTDB, {}, res);
});


// make sure to change the name of the db
app.get('/api/activities/:activity', function(req, res) {
    
    PROJECTDB.find(
      {"activities.activity": req.params.activity},
      {"activities": {$elemMatch: {"activity": req.params.activity}}}        
    ).toArray(function (err, docs) { 
      if (err) { return mongoError(res, err); };
      res.send(docs === null ? [] : docs);
     })
;
});


app.get('/api/activities/ratings/gte/:rating', function(req, res) {
    

    PROJECTDB.find(
      {"activities.properties.rating_of_5": {$gte: parseFloat(req.params.rating)}},
      {"activities": {$elemMatch: {"properties.rating_of_5": {$gte: parseFloat(req.params.rating)}}}}        
    ).toArray(function (err, docs) { 
      if (err) { return mongoError(res, err); };
      res.send(docs === null ? [] : docs);
     })
;
});


// app.get('/static/page1', function (req, res) {
//   // res.send('Hello World!');
//   res.sendFile(__dirname+'/static/page1/index.html');
// });

// app.get('/static/page2', function (req, res) {
//   // res.send('Hello World!');
//   res.sendFile(__dirname+'/static/page2/index.html');
// });


app.set('port', (process.env.PORT || 5000));
app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
