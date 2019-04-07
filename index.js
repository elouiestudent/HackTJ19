#!/usr/bin/nodejs


// -------------- load packages -------------- //
var express = require('express')
var mainpath = require('path');
var app = express();
var hbs = require('hbs');
let https = require ('https');
var Twit = require('twit');
const fs = require('fs') 

var T = new Twit({
  consumer_key:         '7w9qPKMQzbCNvx4cjVoaLqjjt',
  consumer_secret:      'bj8lNT1yJTkZHlIbg6n7NEBTX73oQttmbPy7nCUuEcYEuldt7O',
  access_token:         '4439149653-6eK3Z25ODtI3sg7rv3NqNLAWmO6vz270Lewq1tD',
  access_token_secret:  'AJtrhAdfUmWjWnirvASSsp5PEjDbiNwO5XBDxeSuLypxs',
  timeout_ms:           60*1000,  // optional HTTP request timeout to apply to all requests.
  strictSSL:            true,     // optional - requires SSL certificates to be valid.
})

var allmovements = {};

//needs the topic, and location 
var nyc = '37.781157,-122.398720,20mi'
var mesa = '33.4152,111.8315,20mi'

allmovements["metoocoords"] = []; // create an empty array
allmovements["metoocoords"].push({
    "lat": 40.748817, 
    "lng": -73.985428,
    "twt": "#MeToo Bruh"
});

allmovements["currprotests"] = []; 

allmovements["novprotests"] = []; 
fs.readFile('nov_18_protest.txt', (err, data) => { 
    if (err) throw err; 
    var lines = data.toString().split('\n');
    console.log(data.toString()); 
    console.log(lines);
    for(var line in lines)
    {
        var lat = parseFloat(lines[line].substring(0, lines[line].indexOf(",")));
        var newline = lines[line].substring(lines[line].indexOf(",") + 1);
        var lng = parseFloat(newline.substring(0, newline.indexOf(",")));
        newline = newline.substring(newline.indexOf(",") + 1);
        newline = newline.charAt(0).toUpperCase() + newline.substring(1);
        allmovements["novprotests"].push({
            "lat": lat,
            "lng": lng,
            "twt": newline
        });
    }
}) 

allmovements["octprotests"] = []; 
fs.readFile('oct_18_protest.txt', (err, data) => { 
    if (err) throw err; 
    var lines = data.toString().split('\n');
    console.log(data.toString()); 
    console.log(lines);
    for(var line in lines)
    {
        var lat = parseFloat(lines[line].substring(0, lines[line].indexOf(",")));
        var newline = lines[line].substring(lines[line].indexOf(",") + 1);
        var lng = parseFloat(newline.substring(0, newline.indexOf(",")));
        newline = newline.substring(newline.indexOf(",") + 1);
        newline = newline.charAt(0).toUpperCase() + newline.substring(1);
        allmovements["octprotests"].push({
            "lat": lat,
            "lng": lng,
            "twt": newline
        });
    }
})

allmovements["sepprotests"] = []; 
fs.readFile('sep_18_protest.txt', (err, data) => { 
    if (err) throw err; 
    var lines = data.toString().split('\n');
    console.log(data.toString()); 
    console.log(lines);
    for(var line in lines)
    {
        var lat = parseFloat(lines[line].substring(0, lines[line].indexOf(",")));
        var newline = lines[line].substring(lines[line].indexOf(",") + 1);
        var lng = parseFloat(newline.substring(0, newline.indexOf(",")));
        newline = newline.substring(newline.indexOf(",") + 1);
        newline = newline.charAt(0).toUpperCase() + newline.substring(1);
        allmovements["sepprotests"].push({
            "lat": lat,
            "lng": lng,
            "twt": newline
        });
    }
})  

// -------------- express initialization -------------- //
app.set('port', process.env.PORT || 8800 );
app.set('view engine', 'hbs');

// -------------- variable definition -------------- //
// This counter is stored in RAM, and will be reset every time you
// restart the server.

app.use('/assets/js', express.static(mainpath.join(__dirname, '/assets/js')))
app.use('/assets/css', express.static(mainpath.join(__dirname, '/assets/css')))
app.use('/assets/fonts', express.static(mainpath.join(__dirname, '/assets/fonts')))
app.use('/assets/img', express.static(mainpath.join(__dirname, '/assets/img')))
app.use('/assets/scss', express.static(mainpath.join(__dirname, '/assets/scss')))
app.use('/assets/demo', express.static(mainpath.join(__dirname, '/assets/demo')))

// -------------- express 'get' handlers -------------- //
// These 'getters' are what fetch your pages

app.get('/', function(req, res){
    res.sendFile(__dirname + '/map.html');
});

app.get('/dashboard.html', function(req, res){
    res.sendFile(__dirname + '/dashboard.html');
});

app.get('/map.html', function(req, res){
    res.sendFile(__dirname + '/map.html');
});

app.get('/movementcheck', function(req, res){
    var themovement = req.query.movement;
    var result;
    if(themovement == "metoo")
    {
        result = {
            themovement: allmovements["metoocoords"]
        }
    }
    else
    {
        console.log("allmovements[themovement]:", allmovements[themovement])
        result = {
            themovement: allmovements[themovement]
        }
    }
    res.json(result);
});

app.get('/addcurrprotests', function(req, res){
    allmovements["currprotests"].push({
        "lat": req.query.lat,
        "lng": req.query.lng,
        "twt": req.query.twt
    })
    var result = {
        themovement: allmovements["currprotests"]
    }
    res.json(result);
});

app.get('/addnewmovement', function(req, res){
    console.log("req.query: ", req.query)
    var tweet = req.query.newtweets;
    var id = req.query.id;
    if(id in allmovements == false)
    {
        allmovements[id] = [];
    }
    var lat = parseFloat(tweet.substring(0, tweet.indexOf(",")))
    tweet = tweet.substring(tweet.indexOf(",") + 1)
    var lng = tweet.substring(0, tweet.indexOf(","))
    var twt = tweet.substring(tweet.indexOf(",") + 1)

    console.log("addnewmovement movement: ", tweet)
    allmovements[id].push({
        "lat": lat,
        "lng": lng,
        "twt": twt
    });
    // USE TWITTER TO FIND RECENT HANDLES WITH SPECIFIED KEYWORDS
    // allmovements["currprotests"].push({
    //     "lat": req.query.lat,
    //     "lng": req.query.lng,
    //     "twt": req.query.twt
    // })
    var result = {
        themovement: allmovements[id]
    }
    res.json(result);
});

app.get('/twitter', function(req, res){
    var keywords = req.query.keywords;
    var id = req.query.id;
    var tweets = [];
    console.log("in twitter")
    //added twitter search
    var topic = keywords;
    T.get('search/tweets', {q: topic, count: 50}, function(err, data, response) {
        for(var i = 0; i < data.statuses.length; i++){
            //console.log(data.statuses[i].id_str); 
            console.log("i: ", i)
            if(data.statuses[i].user.location != ''){
                console.log("Tweet: ", data.statuses[i].text);
                console.log("Location: ",data.statuses[i].user.location); //gets the
                tweets.push({
                    "location": data.statuses[i].user.location,
                    "twt": data.statuses[i].text
                })
                
            }
        }
        console.log("tweetsindexjs:",tweets)
        var result = {
            themovement: tweets
        }
        res.json(result);
    })
    //     counter+=1;
    //     if(counter > 10){
    //         console.log("STOP STREAM")
    //         stream.stop();
    //     }
    // })
    // USE TWITTER TO FIND RECENT HANDLES WITH SPECIFIED KEYWORDS
    // tweets.push({
    //     "location": location,
    //     "twt": req.query.twt
    // })
    
});

T.get('search/tweets', {q: 'MeToo', geocode: nyc, count: 5}, function(err, data, response) {
    var nyclat = parseFloat(nyc.substring(0, nyc.indexOf(",")));
    var newnyc = nyc.substring(nyc.indexOf(",") + 1);
    var nyclng = parseFloat(newnyc.substring(0, nyc.indexOf(",")));
    for(var i = 0; i < data.statuses.length; i++){
        console.log(data.statuses[i].id_str); 
        console.log(data.statuses[i].text); //gets the 
        allmovements["metoocoords"].push({
            "lat": nyclat, 
            "lng": nyclng,
            "twt": data.statuses[i].text
        });
    }
})




//Gets the locations of the users based on topic
T.get('users/search', {q: 'MeToo', count: 100}, function(err, data, response) {
    for(var i = 0; i < data.length; i++){
        console.log(data[i].location);
    }
})



T.get('users/search', {q: 'pro life', count: 100}, function(err, data, response) {
    for(var i = 0; i < data.length; i++){
        console.log(data[i].location);
    }
})

// -------------- listener -------------- //
// The listener is what keeps node 'alive.' 

var listener = app.listen(app.get('port'), function() {
  console.log( 'Express server started on port: '+listener.address().port );
});