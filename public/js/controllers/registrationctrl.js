'use strict';

angular.module('app.controllers')
.controller('RegistrationCtrl', ['$scope', function($scope) {
    $scope.usernamePattern = /^[\w\d\_\.\-]{3,18}$/;
    $scope.passwordPattern = /^.{6,128}$/;
    $scope.username = "";
    $scope.password = "";
    $scope.passwordConfirm = "";
    $scope.duplicateUsername = false;

    $scope.validatePassword = function() {
        $scope.form.passwordConfirm.$setValidity('required',
                $scope.password === $scope.passwordConfirm);
    };
}]);
