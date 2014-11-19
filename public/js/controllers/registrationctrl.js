'use strict';

angular.module('app.controllers')
.controller('RegistrationCtrl', ['$http', function($http) {
    this.registered = false;
    this.usernamePattern = /^[\w\d\_\.\-]{3,18}$/;
    this.passwordPattern = /^.{6,128}$/;
    this.username = null;
    this.password = null;
    this.passwordConfirm = null;
    this.duplicateUsername = false;

    this.register = function() {
        var self = this;
        self.duplicateUsername = false;
        $http.post('/api/users/new', {
            username: this.username,
            password: this.password,
            signin: true
        }).success(function(data) {
            if (data.status !== 'success') { return; }
            self.username = data.data.username;
            self.registered = true;
        }).error(function(data) {
            if (data.message === 'Username already exists') {
                self.duplicateUsername = true;
            }
        });
    };

    this.validatePassword = function() {
        this.form.passwordConfirm.$setValidity('required',
                this.password === this.passwordConfirm);
    };
}]);
