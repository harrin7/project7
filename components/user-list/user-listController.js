'use strict';

cs142App.controller('UserListController', ['$scope', '$resource',
    function ($scope, $resource) {
        $scope.main.title = 'Users';
        $scope.userList = $resource("/user/list");
        console.log($scope.userList);


        var userListCallback = function (model) {
                    //do some stuff
                    var userListModel = JSON.parse(model); 

                    $scope.$apply(function () {
                        $scope.userList = userListModel;
                          // Put your code that updates any $scope variables here
                    })
            };


        $scope.FetchModel('http://localhost:3000/user/list', userListCallback);
    }]);

