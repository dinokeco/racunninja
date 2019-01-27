function DashboardController($scope, $rootScope, $http, $location) {
    $rootScope.feed = [];
    $rootScope.userProviders = [];
    $scope.fetchDate = "";

    var config = {
        headers: {
            Authorization: "Basic d2VudHdvcnRobWFuOkNoYW5nZV9tZQ==",
            Accept: "application/json;odata=verbose",
            JWT: localStorage.getItem("user")
        }
    };

    var init = function() {
        formatDate();
        get_user_by_id();
        get_providers();
        get_bills();
    };

    var formatDate = function() {
        let date = new Date();
        let day = date.getDate();
        let month = date.getMonth() + 1;
        let year = date.getFullYear();
        let hours = ("0" + date.getHours()).slice(-2);
        let minutes = ("0" + date.getMinutes()).slice(-2);
        let seconds = ("0" + date.getSeconds()).slice(-2);

        $scope.fetchDate =
            day +
            "/" +
            month +
            "/" +
            year +
            " " +
            hours +
            ":" +
            minutes +
            ":" +
            seconds;
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
                console.log(error.status);
            };
    };
    var get_providers = function() {
        $http.get("/rest/v1/providers", config).then(function(response) {
            $rootScope.providers = response.data;
            filter_providers($rootScope.user, $rootScope.providers);
        }),
            function(error) {
                console.log(error.status);
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
        generate_feed();
    };

    var generate_feed = function() {
        console.log($rootScope);

        get_user_by_id();
        get_bills();

        $rootScope.userProviders.forEach(function(provider) {
            var tempObj = {};
            tempObj.provider = provider.name;
            tempObj.logo = provider.logo;
            tempObj.debt =
                $rootScope["bills"][0].bills.payments[0].paid > 0
                    ? $rootScope["bills"][0].bills.payments[0].paid
                    : parseFloat(0).toFixed(2);
            $rootScope["bills"].forEach(function(bill) {
                if (bill.provider_id === provider._id) {
                    tempObj.statistics = bill.bills.payments;
                }
            });
            $rootScope.feed.push(tempObj);
        });
        $scope.labels = $rootScope.feed[0].statistics
            .map(function(item) {
                return item.date;
            })
            .reverse();
        $scope.series = ["Series A"];
        $scope.data = $rootScope.feed[0].statistics
            .map(function(item) {
                return parseFloat(item.paid.replace(" KM", ""));
            })
            .reverse();
        $scope.onClick = function(points, evt) {
            console.log(points, evt);
        };
    };

    $scope.go = function(path) {
        $location.path(path);
    };

    init();
}
