const express = require('express');
const bodyparser = require("body-parser");
const app = express();

app.use('/', express.static('examples'));
app.use(express.json());       // to support JSON-encoded bodies
app.use(express.urlencoded()); // to support URL-encoded bodies

providers = [
  {'id':1,'name': 'Vodovod','reference_number': 'ASB15215'},
  {'id':2,'name': 'Elektroprivreda','reference_number': 'SRAS8184'},
  {'id':3,'name': 'Kablovska','reference_number': 'TSA9128'}
]

app.post('/rest/v1/login', function(request, response, next){
  console.log('Validating credentials by middleware function');
  next();
}, function(request, response){
  var user = request.body;
  if(user.username == 'becir@gmail.com' && user.password == '123'){
    response.send(true)
  }else{
    response.send(false);
  }
});

app.get('/rest/v1/bills', function(request, response, next){
  console.log('Event received, call next function');
  next();
}, function(request, response, next){
  console.log('Second function called');
  next();
}, function(request, response){
  response.setHeader('Content-Type', 'application/json');
  response.send([
    {'name': 'Vodovod','debt': 200},
    {'name': 'Elektroprivreda','debt': 200}
  ]);
});

app.post('/rest/v1/provider', function(request, response){
  providers.push(request.body);
  console.log(providers);
  response.send('OK');
});

app.put('/rest/v1/provider/edit', function(request, response){
  provider = request.body;
  for(i=0;i<providers.length;i++){
    if(providers[i].id == provider.id){
      providers[i].name = provider.name;
      providers[i].reference_number = provider.reference_number;
    }
  }
  console.log(providers);
  response.send('OK');
});

app.delete('/rest/v1/provider/delete/:id', function(request, response){
  var provider_id = request.params.id;
  for(i=0; i < providers.length; i++){
    if(providers[i].id == provider_id){
      providers.splice(i, 1);
    }
  }
  console.log(providers);
  response.send('OK');
});

app.get('/rest/v1/providers', function(request, response){
  response.setHeader('Content-Type', 'application/json');
  response.send(providers);
});

app.listen(3000, () => console.log('Example app listening on port 3000!'))
