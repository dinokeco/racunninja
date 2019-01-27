function DashboardController($scope, $rootScope, $http) {
    console.log("Hello from dashboard controller");

    var config = {
        headers: {
            Authorization: "Basic d2VudHdvcnRobWFuOkNoYW5nZV9tZQ==",
            Accept: "application/json;odata=verbose",
            JWT: localStorage.getItem("user")
        }
    };

    var init = function() {
        get_bills();
        get_providers();
    };

    var get_bills = function() {
        $http.get("/rest/v1/bills", config).then(function(response) {
            $rootScope.bills = response.data;
        }),
            function(error) {
                console.log(error.status);
            };
    };
    var get_providers = function() {
        $http.get("/rest/v1/providers", config).then(function(response) {
            $rootScope.providers = response.data;
        }),
            function(error) {
                console.log(error.status);
            };
    };

    var generate_feed = function() {};

    init();
}
