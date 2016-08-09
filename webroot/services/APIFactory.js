// This service connects to REST API
app.factory("APIFactory", ['$http', '$q',"cfpLoadingBar",
    function ($http, $q, cfpLoadingBar) { 
        var baseURL = "";
        var config = {};
        var obj = {};
        var ready = false, deferred;
        var queue = [];

        function errorCallback(results){
            cfpLoadingBar.complete();
            return results.data;
        }

        obj.getReady = function(){
            deferred = $q.defer();
            return deferred.promise;
        };

        $http.get('./config.json').then(function(data) {
            baseURL = "http://" + (data.host || 'localhost') + ':' + (data.port || 18080);
            // console.log('initialized baseURL : ', baseURL);

            obj.get = function(REST_Resource){

                cfpLoadingBar.start();

                var APIurl = baseURL + REST_Resource;

                return $http.get(APIurl, config)
                        .then(function(results, status){
                            cfpLoadingBar.complete();
                            return results.data;
                        }, errorCallback);
            };

            obj.post = function (REST_Resource, data) {

                cfpLoadingBar.start();

                var APIurl = baseURL + REST_Resource;

                return $http.post(APIurl, data, config)
                        .then(function(results, status){
                            cfpLoadingBar.complete();
                            return results.data;
                        }, errorCallback);
            };

            obj.put = function (REST_Resource, data) {

                cfpLoadingBar.start();

                var APIurl = baseURL + REST_Resource;

                return $http.put(APIurl, data, config)
                        .then(function(results, status){
                            cfpLoadingBar.complete();
                            return results.data;
                        }, errorCallback);
            };

            obj.delete = function (REST_Resource, data) {

                cfpLoadingBar.start();

                var APIurl = baseURL + REST_Resource;

                return $http.delete(APIurl, data, config)
                        .then(function(results, status){
                            cfpLoadingBar.complete();
                            return results.data;
                        }, errorCallback);
            };

            if(deferred){
                // console.log('resolve');
                deferred.resolve();
            }
        }, function(data) {
            // console.log("err", data);
        });
        return obj;
    }]);