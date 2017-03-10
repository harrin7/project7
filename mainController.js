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
            when('/login-register', {
                templateUrl: 'components/login-register/login-registerTemplate.html',
                controller: 'LoginRegisterController'
            }).
            otherwise({
                redirectTo: '/users'
            });
    }]);

cs142App.controller('MainController', ['$scope', '$resource', '$rootScope', '$location', '$http',
    function ($scope, $resource, $rootScope, $location, $http) {
        $scope.main = {};
        $scope.main.title = 'Users';
        $scope.main.sectionHeader = '';
        $scope.main.versionModel = '';
        $scope.main.firstName = '';
        $scope.main.lastName = '';
        $scope.main.isLoggedIn = '';
        $scope.main.userComment ='';
        $scope.main.userId = '';
        $scope.main.photoDetails = '';

        $scope.main.currentUserName = '';

        var selectedPhotoFile; // Holds the last file selected by the user

        $scope.main.logoutUser = function() {

          console.log('click');
          var logoutRes = $resource('/admin/logout');


          logoutRes.save({}, function () {
            //do something
            console.log('Im back');
            $scope.main.isLoggedIn = false;
            $rootScope.$broadcast("isLoggedOut");
            $location.path("/login-register");
          }, function errHandling(err) {
            console.log('I have an error');
          });
        }
      

        var versionList = $resource('/test/:p1', {p1: '@id'} );
        $scope.main.versionModel = versionList.get({'p1': 'info'}); 

        var versionCallback = function (model) {
                //do some stuff
                var versionModel = JSON.parse(model); 
                console.log(versionModel);

                $scope.$apply(function () {
                    $scope.main.versionModel = versionModel;
                      // Put your code that updates any $scope variables here
                })
        };

        console.log($rootScope);
        $rootScope.$on( "$routeChangeStart", function(event, next, current) {
                  if (!$scope.main.isLoggedIn) {
                     // no logged user, redirect to /login-register unless already there
                    if (next.templateUrl !== "components/login-register/login-registerTemplate.html") {
                        $location.path("/login-register");
                    }
                  }
               }); 

        // This is for photo upload 

          // Called on file selection - we simply save a reference to the file in selectedPhotoFile
          $scope.inputFileNameChanged = function (element) {
              selectedPhotoFile = element.files[0];
          };

          // Has the user selected a file?
          $scope.inputFileNameSelected = function () {
              return !!selectedPhotoFile;
          };

          // Upload the photo file selected by the user using a post request to the URL /photos/new
          $scope.uploadPhoto = function () {
              if (!$scope.inputFileNameSelected()) {
                  console.error("uploadPhoto called will no selected file");
                  return;
              }
              console.log('fileSubmitted', selectedPhotoFile);

              // Create a DOM form and add the file to it under the name uploadedphoto
              var domForm = new FormData();
              domForm.append('uploadedphoto', selectedPhotoFile);

              // Using $http to POST the form
              $http.post('/photos/new', domForm, {
                  transformRequest: angular.identity,
                  headers: {'Content-Type': undefined}
              }).success(function(newPhoto){
                  console.log("succss");
                  // The photo was successfully uploaded. XXX - Do whatever you want on success.
              }).error(function(err){
                  // Couldn't upload the photo. XXX  - Do whatever you want on failure.
                  console.error('ERROR uploading photo', err);
              });

          };

}]);

    


