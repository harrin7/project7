'use strict';

cs142App.controller('UserListController', ['$scope', '$resource',
    function ($scope, $resource) {
        $scope.main.title = 'Users';
        var userList = $resource('/user/list');
        $scope.userList = userList.query();
    }]);

