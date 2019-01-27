// const moment = require("moment");

function ProviderController($scope, $rootScope, $http, Popeye, toaster) {
    $scope.fetchDate = "";
    $scope.formData = {};
    $rootScope.userProviders = [];

    var config = {
        headers: {
            Authorization: "Basic d2VudHdvcnRobWFuOkNoYW5nZV9tZQ==",
            Accept: "application/json;odata=verbose",
            JWT: localStorage.getItem("user")
        }
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
        formatDate();
        get_user_by_id();
        get_providers();
    };

    $scope.addProvider = function() {
        $scope.formData["provider_id"] = $scope.formData["provider"]._id;

        delete $scope.formData["provider"];

        $http
            .post(
                "/rest/v1/provider/add/" + localStorage.getItem("userId"),
                $scope.formData,
                config
            )
            .then(function(response) {
                $rootScope.user["providers"] = response.data[0].providers;
                toaster.pop("info", "Učitavanje podataka u toku...");
                $http
                    .post(
                        "/rest/v1/telemach/overview",
                        {
                            user_id: localStorage.getItem("userId"),
                            provider_id: $scope.formData["provider_id"],
                            username: $scope.formData.username,
                            password: $scope.formData.password
                        },
                        config
                    )
                    .then(function(response) {
                        console.log(response);
                        toaster.pop("success", "Podaci učitani!");
                    }),
                    function(err) {
                        console.log(err);
                    };
                toaster.pop("success", "Usluga dodana!");

                filter_providers($rootScope.user, $rootScope.providers);

                Popeye.closeCurrentModal(true);
            }),
            function(error) {
                toaster.pop("error", "Neuspjela operacija!");
            };
    };

    $scope.toggleModal = function() {
        // Open a modal to show the selected user profile
        var modal = Popeye.openModal({
            templateUrl: "views/modal.html",
            controller: "providerController as ctrl"
        });
    };

    init();
}
