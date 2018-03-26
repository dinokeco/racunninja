app.controller('sidebarCtrl', function($scope, $location, $http){

    $scope.login = function(credentials){
        $http({
            url: '/rest/v1/login',
            method: "POST",
            data: credentials
        }).then(function(response){
            if(response.data == true){
                $scope.myVar = true;
            }else{
                $scope.myVar = false;
            }
        }, function(error){
            console.log(error);
        });
    }

    $scope.logout = function(){
        $scope.myVar = false;
    }

    $scope.getClass = function (path) {
        if (path == '/dashboard' && $location.path() == '/') return 'active';
        return ($location.path() === path) ? 'active' : '';
    },

    $scope.openNavigationDrawer = function(){
        if ($scope.mobileNavigationOpen == 'nav-open'){
            $scope.mobileNavigationOpen = '';
        }else{
            $scope.mobileNavigationOpen = 'nav-open';
        }
        
    }
    $scope.menuItemClicked = function(){
        $scope.mobileNavigationOpen = '';
    }

});