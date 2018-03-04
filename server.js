const express = require('express')
const app = express()
var crypto = require('crypto');
var requestify = require('requestify');
const util = require('util')

let publickey = "46db6904022f7c4f07592219dc6f78cf"
let privatekey = "fc9160812e8b88d79c5d9f786057cf09c764c494"


app.get('/', function(req, res){

})

app.get('/timeline', function(req, res){
  var character = req.query.character;
  var timeStamp = Math.floor(Date.now() / 1000);
  var hash = getHash(timeStamp)
  var url = "http://gateway.marvel.com/v1/public/characters?name=" + character + "&ts=" + timeStamp + "&apikey=" + publickey + "&hash=" + hash
  httpGet(url)
})


app.listen(8000, () => console.log('port 8000'))

function httpGet(url) {
  console.log(url)
  requestify.get(url)
    .then(function(response) {
      var same = response.getBody();
      console.log(same)
      var obj = JSON.parse(same)
      var data = obj.data
      var results = data.results

    }
  );
}

function getHash(timestamp){
  var same = crypto.createHash('md5').update(timestamp + privatekey + publickey).digest("hex");
  return same
}