const express = require('express');
const bodyparser = require("body-parser");
const app = express();
const MongoClient = require('mongodb').MongoClient;
const jwt_secret = 'WU5CjF8fHxG40S2t7oyk';

var jwt    = require('jsonwebtoken');
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

app.use('/rest/v1/',function(request,response,next){
  jwt.verify(request.get('JWT'), jwt_secret, function(error, decoded) {      
    if (error) {
      response.status(401).send('Unauthorized access');    
    } else {
      db.collection("users").findOne({'_id': new MongoId(decoded._id)}, function(error, user) {
        if (error){
          throw error;
        }else{
          if(user){
            next();
          }else{
            response.status(401).send('Credentials are wrong.');
          }
        }
      });
    }
  });  
})
app.post('/login', function(request, response){
  var user = request.body;

  db.collection("users").findOne({'username': user.username, 'password': user.password}, function(error, user) {
    if (error){
      throw error;
    }else{
      if(user){
        var token = jwt.sign(user, jwt_secret, {
          expiresIn: 20000 
        });
    
        response.send({
          success: true,
          message: 'Authenticated',
          token: token
        })
      }else{
        response.status(401).send('Credentials are wrong.');
      }
    }
  });
});

app.get('/rest/v1/bills', function(request, response){
  db.collection('bills').find().toArray((err, bills) => {
    if (err) return console.log(err);
    response.setHeader('Content-Type', 'application/json');
    response.send(bills);
  })
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

app.post('/rest/v1/bill', function(request, response){
  db.collection('bills').save({'bill_number':request.body.bill_number,
                               'provider_id':request.body.provider_id,
                               'amount': request.body.amount,
                               'date': new Date(request.body.date)}, (err, result) => {
    if (err) return console.log(err);
    response.send('OK');
  })
});

app.get('/rest/v1/report', function(request, response){
  db.collection('bills').aggregate(
    [ 
      { '$match': { "date": { '$exists': true } } },
      { '$group': { "_id": { "year": { '$year': "$date"}, "month": {'$month': "$date"} }, "total": { '$sum' : "$amount"} } },
      { '$sort' : { "_id.year" : -1, "_id.month" : -1 } }
    ],
  function(err, documents) {
      if (err) return console.log(err);
      response.send(documents);
    }
  );
});

MongoClient.connect('mongodb://localhost:27017/racunninja', (err, database) => {
  if (err) return console.log(err)
  db = database
  app.listen(3000, () => console.log('Example app listening on port 3000!'))
})

