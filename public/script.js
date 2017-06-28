// script.js

    // create the module and name it scotchApp
        // also include ngRoute for all our routing needs
    var scotchApp = angular.module('scotchApp', ['ngRoute']);

    // configure our routes
    scotchApp.config(function($routeProvider) {
        $routeProvider
           .when('/', {
                templateUrl : 'home.html',
                controller  : 'upload'
            })

            // route for the about page
            .when('/about', {
                templateUrl : 'about.html',
                controller  : 'aboutController'
            })

            // route for the contact page
            .when('/contact', {
                templateUrl : 'contact.html',
                controller  : 'contactController'
            });
    });

    // create the controller and inject Angular's $scope
    scotchApp.controller('mainController', function($scope, $http) {
        console.log('main')

        $scope.faces = [];
        // create a message to display in our view
        $scope.message = 'Everyone come and see how good I look!';
        var req = $http({
            method: 'POST',
            //url: 'http://jsonplaceholder.typicode.com/posts', 
            url: '/api/faces/v1'});
        req.then(function(data, err){
          console.log(data);
          console.log('errr'+err);
          $scope.faces = data.data.Faces;
          console.log($scope.faces)
        }, 
        function(error){
          console.log(error)
          alert(error.data.message)
        })




    });

    scotchApp.controller('aboutController', function($scope) {
        console.log('about')
        $scope.message = 'Look! I am an about page.';
    });

    scotchApp.controller('contactController', function($scope) {
        console.log('contact')
        $scope.message = 'Contact us! JK. This is just a demo.';
    });








    scotchApp .controller("upload", ['$scope', '$http', 'uploadService', function($scope, $http, uploadService) {
    

    $scope.$watch('file', function(newfile, oldfile) {
        
        if(angular.equals(newfile, oldfile) ){
            return;
        }

        console.log('wathc')
        console.log(newfile)
      uploadService.upload(newfile).then(function(res){
        // DO SOMETHING WITH THE RESULT!
        console.log("result", res);
      })
    });

  }])
  .service("uploadService", function($http, $q) {

    return ({
      upload: upload
    });

    function upload(file) {
      var upl = $http({
        method: 'POST',
        //url: 'http://jsonplaceholder.typicode.com/posts', 
        url: '/users/upload', 
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        data: {
          image: file
        },
        transformRequest: function(data, headersGetter) {
          var formData = new FormData();
          angular.forEach(data, function(value, key) {
            formData.append(key, value);
          });

          var headers = headersGetter();
          delete headers['Content-Type'];

          return formData;
        }
      });
      return upl.then(handleSuccess, handleError);

    } // End upload function

    // ---
    // PRIVATE METHODS.
    // ---
  
    function handleError(response, data) {
      if (!angular.isObject(response.data) ||!response.data.message) {
        return ($q.reject("An unknown error occurred."));
      }

      return ($q.reject(response.data.message));
    }

    function handleSuccess(response) {
      return (response);
    }

  })

  .directive("fileinput", [function() {
    return {
      scope: {
        fileinput: "=",
        filepreview: "="
      },
      link: function(scope, element, attributes) {
        element.bind("change", function(changeEvent) {
          scope.fileinput = changeEvent.target.files[0];
          var reader = new FileReader();
          reader.onload = function(loadEvent) {
            scope.$apply(function() {
              scope.filepreview = loadEvent.target.result;
            });
          }
          reader.readAsDataURL(scope.fileinput);
        });
      }
    }
  }]);
