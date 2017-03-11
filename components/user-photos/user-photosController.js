'use strict';

cs142App.controller('UserPhotosController', ['$scope', '$routeParams', '$resource', '$location', '$rootScope',
  function($scope, $routeParams, $resource, $location, $rootScope) {
    /*
     * Since the route is specified as '/photos/:userId' in $routeProvider config the
     * $routeParams  should have the userId property set with the path from the URL.
     */
    var Id = $routeParams.userId;
    $scope.main.userComment ='';
    
    const userId = $routeParams.userId;
    $scope.main.userId = userId;

    var user = $resource('/photosOfUser/:userid', {userid: '@id'} );
     $scope.photoDetails= user.query({'userid': userId});
     
    


    $scope.userComment = function (photo) {
        var comment = $scope.main.userComment;
        var commentRes = $resource('/commentsOfPhoto/'+photo._id);

        commentRes.save({comment : comment}, function (photo) {
            //do something
            $scope.photoDetails = user.query({'userid': userId});
            console.log($scope.photoDetails);
            console.log('Im back in comments');
            $scope.main.userComment = '';
            //update page

            
        }, function errHandling(err) {
            console.log('I have an error');
        });
    }

  }]);
