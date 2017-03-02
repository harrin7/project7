'use strict';

var cs142App = angular.module('cs142App', ['ngRoute', 'ngMaterial', 'ngResource']);

cs142App.config(function($mdThemingProvider) {
  $mdThemingProvider.theme('default')
    .primaryPalette('teal')
    .accentPalette('grey');
});

cs142App.config(['$routeProvider',
    function ($routeProvider) {
        $routeProvider.
            when('/users', {
                templateUrl: 'components/user-list/user-listTemplate.html',
                controller: 'UserListController'
            }).
            when('/users/:userId', {
                templateUrl: 'components/user-detail/user-detailTemplate.html',
                controller: 'UserDetailController'
            }).
            when('/photos/:userId', {
                templateUrl: 'components/user-photos/user-photosTemplate.html',
                controller: 'UserPhotosController'
            }).
            otherwise({
                redirectTo: '/users'
            });
    }]);

cs142App.controller('MainController', ['$scope',
    function ($scope) {
        $scope.main = {};
        $scope.main.title = 'Users';
        $scope.main.sectionHeader = '';
        $scope.main.versionModel = '';
        $scope.main.firstName = '';
        $scope.main.lastName = '';  


        var versionCallback = function (model) {
                //do some stuff
                var versionModel = JSON.parse(model); 
                console.log(versionModel);

                $scope.$apply(function () {
                    $scope.main.versionModel = versionModel;
                      // Put your code that updates any $scope variables here
                })
        };



    /*
      * FetchModel - Fetch a model from the web server.
      *   url - string - The URL to issue the GET request.
      *   doneCallback - function - called with argument (model) when the
      *                  the GET request is done. The argument model is the
      *                  objectcontaining the model. model is undefined in 
      *                  the error case.
      */
    $scope.FetchModel = function(url, doneCallback) {
        
        var xhrHandler = function(){
              //Don’t do anything if not final state
              if (this.readyState!== 4){ 
                  return; 
              }
                  //Final State but status not OK
              if (this.status !== 200) {
                  return;
              }
              //store responseText (model?) in variable text 
              var text = this.responseText;
              
              //call doneCallback to do something with this text. 
              doneCallback(text);
            //Final State & status OK
            //do something with response.text
        }
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = xhrHandler;
        xhr.open("GET", url);
        xhr.send();
    };

    $scope.FetchModel('http://localhost:3000/test/info', versionCallback);

}]);

    


