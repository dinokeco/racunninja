function TableController($scope, $rootScope, $http) {
    $scope.provider = {};
    $rootScope.bill = {};

    var config = {
        headers: {
            Authorization: "Basic d2VudHdvcnRobWFuOkNoYW5nZV9tZQ==",
            Accept: "application/json;odata=verbose",
            JWT: localStorage.getItem("user")
        }
    };

    var get_user_by_id = function() {
        $http
            .get("/rest/v1/users/" + localStorage.getItem("userId"), config)
            .then(function(response) {
                $rootScope.user = response.data[0];
            }),
            function(error) {
                console.log(error);
            };
    };

    var get_bills = function() {
        $http.get("/rest/v1/bills", config).then(function(response) {
            $rootScope.bills = response.data;
        }),
            function(error) {
                console.log(error);
            };
    };

    var get_providers = function() {
        $http.get("/rest/v1/providers", config).then(function(response) {
            $rootScope.providers = response.data;
            filter_providers($rootScope.user, $rootScope.providers);
        }),
            function(error) {
                console.log(error);
            };
    };

    var filter_providers = function(user, providers) {
        $rootScope.userProviders = [];
        user["providers"].forEach(function(provider) {
            providers.forEach(function(element) {
                if (provider.provider_id === element._id) {
                    $rootScope.userProviders.push(element);
                }
            });
        });
    };

    var init = function() {
        get_user_by_id();
        get_bills();
        get_providers();
    };

    init();

    $scope.filterBills = function() {
        $rootScope.bill = {};
        $rootScope.bills.forEach(element => {
            if (element.provider_id === $scope.provider._id) {
                $rootScope.bill = element;
            }
        });
    };
}
