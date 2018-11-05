function ProviderController($scope, $http) {
    console.log("Hello from provider controller");
    $scope.logger = function() {
        console.log("Hello from provider controller");
    };
}
