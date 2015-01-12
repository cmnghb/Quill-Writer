angular.module('quill-writer', [
    'ui.router',
    require('../../.tmp/config').name,
    require('../../.tmp/templates').name,

    // features
    require('./home/').name,
    require('./game/').name,
    require('./game/finish/').name,
    require('./lobby/').name,
    require('./sample/').name,
    require('./link/').name,
    require('./myactivity/').name,

    // admin features
    require('./form/').name,
    require('./form/link/').name,

    // common, including services
    require('./../common/').name,

    require('empirical-angular').name,

    // third party modules
    // These will not be browserified
    'firebase',
    //'ui.bootstrap',
    'mgcrea.ngStrap',
    'underscore',
    'LocalStorageModule',
    'angulartics',
    'angulartics.mixpanel',
    'uuid4',
    'ngClipboard',
  ])

  .config(function($stateProvider, $urlRouterProvider, ngClipProvider, $locationProvider) {
    $urlRouterProvider.otherwise('/');

    // Enable HTML5 mode so that URLs generated by the LMS can be loaded in the iframe.
    $locationProvider.html5Mode({
      enabled: true
    });

    $stateProvider
      .state('quill-writer', {
        abstract: true,
        views: {
          'header': {
            templateUrl: 'header.html'
          },
          'content': {
            template: '<div>Main Content</div>'
          },
          'footer': {
            templateUrl: 'footer.html'
          }
        }
      });
    ngClipProvider.setPath("//cdnjs.cloudflare.com/ajax/libs/zeroclipboard/2.1.6/ZeroClipboard.swf");

  })

;
