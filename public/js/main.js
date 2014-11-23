'use strict';

angular.module('app', [
    'ui.bootstrap',
    'LocalStorageModule',
    'app.controllers',
    'app.directives',
    'app.services'
]).config(['$locationProvider', 'localStorageServiceProvider',
        function($locationProvider, localStorageServiceProvider) {
    $locationProvider.html5Mode(true).hashPrefix('!');
    localStorageServiceProvider
        .setPrefix('todoApp')
        .setStorageType('sessionStorage');
}]);

angular.module('app.controllers', []);
angular.module('app.directives', []);
angular.module('app.services', []);
