'use strict';

cs142App.controller('UserDetailController', ['$scope', '$routeParams', '$resource',
  function ($scope, $routeParams, $resource) {
    /*
     * Since the route is specified as '/users/:userId' in $routeProvider config the
     * $routeParams  should have the userId property set with the path from the URL.
     */
    const userId = $routeParams.userId;

    var user = $resource('/user/:userid', {userid: '@id'} );
    $scope.userDetails = user.get({'userid': userId});

  }]);
