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
  httpGet(url, same)
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
      var image = results.thumbnail.path + "." + results.thumbnail.extension
      console.log(image)
      callback(id,description, image)
    });
}

function same(id,description,image_url) {
  var timeStamp2 = Math.floor(Date.now() / 1000);
  var hash2 = getHash(timeStamp2)
  var url2 = "https://gateway.marvel.com/v1/public/characters/" + id + "/stories?apikey=" + publickey  + "&ts=" + timeStamp2 + "&hash=" + hash2
  console.log(url2)
};

function httpGet2(url, callback) {
  console.log(url)
  requestify.get(url)
    .then(function(response) {
      var same = response.getBody();
      console.log(same)
      var data = same.data
      console.log(data)
      var stuffed_data = [id,description,image]
      callback(stuffed_data)
    }
  );
}


function getHash(timestamp){
  var same = crypto.createHash('md5').update(timestamp + privatekey + publickey).digest("hex");
  return same
}
