'use strict';

cs142App.controller('LoginRegisterController', ['$scope', '$routeParams', '$resource', '$http', '$location', '$rootScope',
  function ($scope, $routeParams, $resource, $http, $location, $rootScope) {
    /*
     * Since the route is specified as '/users/:userId' in $routeProvider config the
     * $routeParams  should have the userId property set with the path from the URL.
     */
    $scope.main.userError = false;
    $scope.main.passwordMatch = true;
    $scope.main.userLogin = '';
    $scope.main.newUserLogin = '';
    $scope.main.userPassword = '';
    $scope.main.createPassword = '';
    $scope.main.confirmPassword = '';
    $scope.main.newFirstName = '';
    $scope.main.newLastName = '';
    $scope.main.newLocation = '';
    $scope.main.newDescription = '';
    $scope.main.newOccupation = '';
    $scope.main.canSubmit = true;
    $scope.main.nameExists = false;

    $scope.checkPasswords = function (){
    	if ($scope.main.createPassword === $scope.main.confirmPassword) {
    		$scope.main.passwordMatch = true;
    	}
    	else {
    		$scope.main.passwordMatch = false;
    	}
    }

    $scope.registerUser = function () {
    	if (!$scope.main.passwordMatch) {
    		$scope.main.canSubmit = false;
    	}
    	else {
    		$scope.main.canSubmit = true;
    		var newUser = {
			    first_name : $scope.main.newFirstName,
			    last_name :  $scope.main.newLastName,
			    location :  $scope.main.newLocation,
			    description : $scope.main.newDescription,
			    occupation : $scope.main.newOccupation,
			    login_name : $scope.main.newUserLogin,
			    password : $scope.main.createPassword
    		}

    		var regRes = $resource('/user');

    		regRes.save({newUser : newUser}, function (user) {
    			//do something
    			console.log('user uploaded');
    			$scope.main.isLoggedIn = true;
    			$rootScope.$broadcast("isLoggedIn");
    			$location.path('/users/'+user._id);

    		}, function errHandling(err) {
    			console.log(err.data);
    			$scope.main.nameExists = true;
    			//do something with any erros
    		});
    	}
    }

    $scope.loginUser = function () {
    	$scope.main.userError = 0;
    	var name = $scope.main.userLogin;
    	var password = $scope.main.userPassword;
    	var info ={
    		name : name,
    		password : password
    	};
	    var loginRes = $resource('/admin/login');

	    loginRes.save({login_info: info}, function (user) {
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