var app = angular.module('addressbook',['ngRoute', 'ngAnimate', 'toaster', 'cfp.loadingBar', 'ui.bootstrap']);

// angular configs
app.config(['$routeProvider', 'cfpLoadingBarProvider', function ($routeProvider, cfpLoadingBarProvider) {
    // hide Loading Bar and use only Loading Spinner
    cfpLoadingBarProvider.includeBar= false;

    // router config
    $routeProvider
        .when('/', { // contacts pages
            templateUrl: 'pages/listContacts.html',
            controller: 'ContactsController'
        })
        .when('/error', { // NOT FOUND page
            templateUrl: 'pages/404-Page.html'
        })
        .otherwise({ // redirect to error page
            redirectTo: '/error'
        });
}]);

// allow to enter only numeric character
app.directive('numbersOnly', function () {
    return {
        require: 'ngModel',
        link: function (scope, element, attr, ngModelCtrl) {
            function fromUser(text) {
                if (text) {
                    var transformedInput = text.replace(/[^0-9]/g, '');
                    //console.log('Method : numbersOnly -> Input : ', text, ' transformedInput : ', transformedInput);
                    if (transformedInput !== text) {
                        ngModelCtrl.$setViewValue(parseInt(transformedInput));
                        ngModelCtrl.$render();
                    }
                    return transformedInput;
                }
                return undefined;
            }            
            ngModelCtrl.$parsers.push(fromUser);
        }
    };
});