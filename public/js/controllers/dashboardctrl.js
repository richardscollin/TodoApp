'use strict';

angular.module('app.controllers')
.controller('DashboardCtrl', ['$scope', 'oauth',
        function($scope, oauth) {
    console.log(oauth.token);
}]);
