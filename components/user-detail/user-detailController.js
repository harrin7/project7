'use strict';

cs142App.controller('UserDetailController', ['$scope', '$routeParams',
  function ($scope, $routeParams) {
    /*
     * Since the route is specified as '/users/:userId' in $routeProvider config the
     * $routeParams  should have the userId property set with the path from the URL.
     */
    var userId = $routeParams.userId;
    $scope.userDetails = '';
    

    var userCallback = function (model) {
                //do some stuff
                var userModel = JSON.parse(model); 

                $scope.$apply(function () {
                    $scope.userDetails = userModel;
                    $scope.main.sectionHeader = $scope.userDetails.first_name + ' ' + $scope.userDetails.last_name; 
                      // Put your code that updates any $scope variables here
                })
        };

    $scope.FetchModel('http://localhost:3000/user/'+userId, userCallback);
        

  }]);
