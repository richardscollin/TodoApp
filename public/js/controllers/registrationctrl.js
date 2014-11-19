'use strict';

angular.module('app.controllers')
.controller('RegistrationCtrl', ['$http', function($http) {
    this.usernamePattern = /^[\w\d\_\.\-]{3,18}$/;
    this.passwordPattern = /^.{6,128}$/;
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
            if (data.message === 'Username already exists') {
                // TODO: show duplicate user message
            }
        });
    };

    this.usernameIsValid = function() {
        if (!this.username) { return false; }
        return /^[\w\d\_\.\-]{3,18}$/.test(this.username.trim());
    };
}]);
