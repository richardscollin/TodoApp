'use strict';

/**
 * OAuth service for authentification with the RESTful API.
 */
angular.module('app.services')
.factory('oauth', ['localStorageService', '$location',
        function(localStorageService, $location) {
    // The regex to extract the token from the hash url.
    var regex = /[^(access_token=)](.*)(?=&token_type=Bearer)/,
        hash = $location.hash();

    /**
     * If the hash url starts with "access_token", extract
     * the access token from the url and store it in local storage.
     */
    if (/^(access_token).*$/.test(hash)) {
        if (setToken(hash.match(regex)[0])) {
            $location.hash('');
        }
    }

    /**
     * Function to set token in local storage.
     * @param token The token to set.
     * @return {boolean} Whether or not the operation is successful.
     */
    function setToken(token) {
        return localStorageService.set('token', token);
    }

    /**
     * Function to get token from local storage.
     * @return The access token.
     */
    function getToken() {
        return localStorageService.get('token');
    }

    /**
     * Function to remove the token.
     * @return Whether or not the token has been removed.
     */
    function removeToken() {
        return localStorageService.remove('token');
    }

    return {
        token: getToken(),
        removeToken: removeToken
    };
}]);
