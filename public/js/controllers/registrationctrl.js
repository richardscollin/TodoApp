'use strict';

angular.module('app.controllers')
.controller('RegistrationCtrl', ['$http', function($http) {
    this.username = null;
    this.password = null;
    this.passwordConfirm = null;

    this.register = function() {
        $http.post('/api/users/new', {
            username: this.username,
            password: this.password,
            // signin: true
        }).success(function(data) {
            console.log(data);
        }).error(function(data) {
            console.log(data);
        });
    };

    this.usernameIsValid = function() {
        return /^[\w\d\_\.\-]{3,18}$/.test(this.username.trim());
    };
}]);
