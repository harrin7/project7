'use strict';

cs142App.controller('UserPhotosController', ['$scope', '$routeParams',
  function($scope, $routeParams) {
    /*
     * Since the route is specified as '/photos/:userId' in $routeProvider config the
     * $routeParams  should have the userId property set with the path from the URL.
     */
    var userId = $routeParams.userId;
    console.log(userId);
    $scope.photoDetails = '';
    $scope.userDetails = '';

    var photoCallback = function (model) {
                //do some stuff
                var photoModel = JSON.parse(model); 

                $scope.$apply(function () {
                    $scope.photoDetails = photoModel;
                      // Put your code that updates any $scope variables here
                })
        };

    var userCallback = function (model) {
                //do some stuff
                var userModel = JSON.parse(model); 

                $scope.$apply(function () {
                    $scope.userDetails = userModel;
                    $scope.main.sectionHeader = 'Photos by: ' + $scope.userDetails.first_name + ' ' + $scope.userDetails.last_name; 
                      // Put your code that updates any $scope variables here
                })
        };

    $scope.FetchModel('http://localhost:3000/user/'+userId, userCallback);

    $scope.FetchModel('http://localhost:3000/photosOfUser/'+userId, photoCallback);


  }]);
