const express = require('express');
const bodyparser = require("body-parser");
const app = express();
const MongoClient = require('mongodb').MongoClient;

var MongoId = require('mongodb').ObjectID;
var db;

app.use('/', express.static('examples'));
app.use(express.json());       // to support JSON-encoded bodies
app.use(express.urlencoded()); // to support URL-encoded bodies

providers = [
  {'id':1,'name': 'Vodovod','reference_number': 'ASB15215'},
  {'id':2,'name': 'Elektroprivreda','reference_number': 'SRAS8184'},
  {'id':3,'name': 'Kablovska','reference_number': 'TSA9128'}
]

app.post('/rest/v1/login', function(request, response){
  var user = request.body;
  if(user.username == 'becir@gmail.com' && user.password == '123'){
    response.send(true)
  }else{
    response.send(false);
  }
});

app.get('/rest/v1/bills', function(request, response){
  db.collection('users').find().toArray((err, result) => {
    if (err) return console.log(err)
    console.log(result);
  })

  response.setHeader('Content-Type', 'application/json');
  response.send([
    {'name': 'Vodovod','debt': 200},
    {'name': 'Elektroprivreda','debt': 200}
  ]);
});

app.post('/rest/v1/provider', function(request, response){
  db.collection('providers').save(request.body, (err, result) => {
    if (err) return console.log(err);
    response.send('OK');
  })
});

app.put('/rest/v1/provider/edit', function(request, response){
  provider = request.body;
  db.collection('providers').findOneAndUpdate( {_id: new MongoId(provider._id) }, {
    $set: {name: provider.name, reference_number: provider.reference_number}
  }, (err, result) => {
    if (err) return res.send(err);
    response.send('OK');
  })
});

app.delete('/rest/v1/provider/delete/:id', function(request, response){
  db.collection('providers').findOneAndDelete({_id: new MongoId(request.params.id)}, (err, result) => {
    if (err) return res.send(500, err)
    response.send('OK');
  })
});

app.get('/rest/v1/providers', function(request, response){
  db.collection('providers').find().toArray((err, providers) => {
    if (err) return console.log(err);
    response.setHeader('Content-Type', 'application/json');
    response.send(providers);
  })
});

MongoClient.connect('mongodb://localhost:27017/racunninja', (err, database) => {
  if (err) return console.log(err)
  db = database
  app.listen(3000, () => console.log('Example app listening on port 3000!'))
})

