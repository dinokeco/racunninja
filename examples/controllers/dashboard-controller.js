function DashboardController($scope, $http){
    console.log("Hello from dashboard controller");

    var init = function(){
      get_bills();
      get_providers();
      //get_countries_php();
    }
    var get_bills = function (){
      $http.get('/rest/v1/bills').then(function(response){
        $scope.bills = response.data;
      }),function(response){
        alert(response.status);
      }
    };
    var get_providers = function (){
      $http.get('/rest/v1/providers').then(function(response){
        $scope.providers = response.data;
      }),function(response){
        alert(response.status);
      }
    };

    var get_countries_php = function (){
      $http.get("http://localhost/weblab/data.php").then(function(response){
        $scope.countries = response.data;
      }),function(response){
        alert('ERROR');
      }
    };

    init();

    $scope.delete_provider = function(id){
      $http.delete('/rest/v1/provider/delete/'+id).then(function(response){
        get_providers();
      }, function(error){
        console.log(error);
      });
    }
    $scope.edit_provider = function(provider){
      $http.put('/rest/v1/provider/edit', provider).then(function(response){
        get_providers();
      }, function(error){
        console.log(error);
      });
    }
    $scope.add_provider = function(){
      $http.post('/rest/v1/provider', $scope.provider).then(function(response){
        $scope.provider = null;
        get_providers();
      }, function(error){
        console.log(error);
      });
    }
  }
