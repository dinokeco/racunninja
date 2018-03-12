app.controller('sidebarCtrl', function($scope, $location){

    $scope.login = function(){
        $scope.myVar = true;
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

/*
function SidebarController($scope, $location){
    console.log("Hello from angular controller");

    $scope.isActive = function (viewLocation) { 
        return viewLocation === $location.path();
    };
    $scope.dashboard_active = 'active'; 
}*/