function DashboardController($scope, $http){
    console.log("Hello from dashboard controller");
  /*
    var refresh = function (){
      $http.get('/contacts').success(function(response){
        console.log('i got data from server');
        $scope.contact_list = response;
        $scope.contact = "";
      })
    };
    refresh();
  
    $scope.add_contact = function(){
      console.log($scope.contact);
      $http.post('/contact', $scope.contact).success(function(response){
        console.log(response);
        refresh();
      });
    }
  
    $scope.remove_contact = function(contact_id){
      console.log('remove '+ contact_id);
      $http.delete('/contact/'+contact_id).success(function(response){
        refresh();
      });
    }
  
    $scope.edit_contact = function (contact_id){
      $http.get('/contact/'+contact_id).success(function(response){
        $scope.contact = response;
      });
    }
  
    $scope.update_contact = function (){
      console.log($scope.contact._id);
      $http.put('contact/'+$scope.contact._id, $scope.contact).success(function(response){
        refresh();
      });
    }
  */
  }
  