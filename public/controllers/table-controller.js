function TableController($scope, $rootScope, $http) {
    console.log("Hello from table controller");

    var config = {
        headers: {
            Authorization: "Basic d2VudHdvcnRobWFuOkNoYW5nZV9tZQ==",
            Accept: "application/json;odata=verbose",
            JWT: localStorage.getItem("user")
        }
    };

    var init = function() {
        get_telemach_bills();
        get_telemach_payments();
    };

    var get_telemach_bills = function() {
        $http
            .get("/rest/v1/telemach/overview", config)
            .then(function(response) {
                console.log(response.data);
                $rootScope.telemachReports = response.data;
            }),
            function(error) {
                console.log(error);
            };
    };

    var get_telemach_payments = function() {
        $http
            .get("/rest/v1/telemach/payments", config)
            .then(function(response) {
                console.log(response.data);
                $rootScope.telemachPayments = response.data;
            }),
            function(error) {
                console.log(error);
            };
    };

    // init();
}
