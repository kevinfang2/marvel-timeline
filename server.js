const express = require('express')
const app = express()
var crypto = require('crypto');
var requestify = require('requestify');
const util = require('util')

var engines = require('consolidate');

app.use(express.static(__dirname));
app.set('view engine', 'html');
app.set('views', __dirname + "/views/");
app.engine('html', engines.mustache);

let publickey = "46db6904022f7c4f07592219dc6f78cf"
let privatekey = "fc9160812e8b88d79c5d9f786057cf09c764c494"

var events = []
var years = []
var image = ""


app.get('/', function(req, res){

})

app.get('/timeline', function(req, res){
  var character = req.query.character;
  var timeStamp = Math.floor(Date.now() / 1000);
  var hash = getHash(timeStamp)
  var url = "http://gateway.marvel.com/v1/public/characters?name=" + character + "&ts=" + timeStamp + "&apikey=" + publickey + "&hash=" + hash
  httpGet(url, same)
  setTimeout(function(){
    var sorted_events = []
    years.sort(function(a, b){return a - b});
    for (x=0; x<years.length; x++){
      year = years[x]
      for (y=0;y<years.length; y++){
        var event1 = events[y]
        var date_modified = event1.modified
        var same = date_modified.split('')
        same.splice(4,20)
        real_date = same.join('');

        if(real_date == year){
          sorted_events.push(event1)
          var index = events.indexOf(event1);

          events.splice(index,1)
          break
        }
      }
    }
    var titles = []
    var creator = []
    var descriptions = []
    for (var x=0; x<sorted_events.length; x++){
      var event2 = sorted_events[x]
      console.log(event2)
      if(event2.creators.items[0] == null){
        creator.push("unknown")
      }
      else{
        var creator_name = event2.creators.items[0].name
        creator.push(creator_name)
      }
      titles.push(event2.title)
      var timeStamp2 = Math.floor(Date.now() / 1000);
      var hash2 = getHash(timeStamp2)
      var url5 = event2.resourceURI + "?apikey=" + publickey + "&ts=" + timeStamp2 + "&hash=" + hash2
      requestify.get(url5)
        .then(function(response) {
          var same = response.getBody();
          var data = same.data.results
          var description = data.description
          if(description == ''){
            descriptions.push("no description provided")
          }
          else{
            descriptions.push(description)
          }
        }
      );
    }

    data = { descriptions: descriptions, titles:titles, creators:creator, years:year, images:image }
    res.render('timeline.html', data);

  }, 5000)
})

app.listen(8000, () => console.log('port 8000'))

function httpGet(url, callback) {
  requestify.get(url)
    .then(function(response) {
      var same = response.getBody();
      var data = same.data
      var results = data.results
      var results = results[0]

      var id = results.id
      var description = results.description
      image = results.thumbnail.path + "." + results.thumbnail.extension
      callback(id,description)
    });
}

function same(id,description) {
  var timeStamp2 = Math.floor(Date.now() / 1000);
  var hash2 = getHash(timeStamp2)
  var url2 = "https://gateway.marvel.com/v1/public/characters/" + id + "/stories?apikey=" + publickey  + "&ts=" + timeStamp2 + "&hash=" + hash2

  var order = []

  requestify.get(url2)
    .then(function(response) {
      var same = response.getBody();
      var data = same.data
      var same2 = data.results

      for (x=0; x<same2.length; x++) {
        var curr_data = same2[x]
        var date_modified = curr_data.modified
        var same = date_modified.split('')
        same.splice(4,20)
        real_date = same.join('');
        years.push(parseInt(String(real_date)))
        events.push(curr_data)
      }
    }
  );
}



function getHash(timestamp){
  var same = crypto.createHash('md5').update(timestamp + privatekey + publickey).digest("hex");
  return same
}
