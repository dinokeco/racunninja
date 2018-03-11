app.controller('sidebarCtrl', function($scope, $location){
    console.log("Hello from angular controller "+ $location.path());

    $scope.getClass = function (path) {
        return ($location.path() === path) ? 'active' : '';
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