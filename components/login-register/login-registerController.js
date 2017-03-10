'use strict';

cs142App.controller('LoginRegisterController', ['$scope', '$routeParams', '$resource', '$http', '$location', '$rootScope',
  function ($scope, $routeParams, $resource, $http, $location, $rootScope) {
    /*
     * Since the route is specified as '/users/:userId' in $routeProvider config the
     * $routeParams  should have the userId property set with the path from the URL.
     */
    $scope.main.userLogin = '';
    $scope.main.userError = 0;

    $scope.loginUser = function () {
    	$scope.main.userError = 0;
    	var name = $scope.main.userLogin;
	    var loginRes = $resource('/admin/login');

	    loginRes.save({login_name: name}, function (user) {
	    	//do something
	    	console.log('Im back');
	    	$scope.main.isLoggedIn = true;
	    	$scope.main.currentUserName = user.login_name;
	    	$rootScope.$broadcast("isLoggedIn");
	    	$location.path('/users/'+user._id);
	    }, function errHandling(err) {
	    	console.log('I have an error');
	    	$scope.main.userError = 1;
	    	//do something with any erros
	    });
	}
}])