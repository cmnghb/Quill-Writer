var fs = require('fs');

angular.module('sf.form', [
    'ui.router'
  ])

  .config(function($stateProvider) {
    $stateProvider
      .state('sf.form', {
        url: '/form?uid',
        views: {
          'content@': {
            template: fs.readFileSync(__dirname + '/form.tpl.html'),
            controller: 'FormCtrl as form'
          }
        }
      });
  })

  .controller('FormCtrl', function(Form) {
    var form = this;

    form.currentForm = {};

    //Initialize the empty word list
    form.currentForm.wordList = [{}];

    form.submitForm = function(f) {
      Form.submit(f, function(err, refName) {
        //do something sending the quill.js close form event thing
        if (err) {
          form.message = err;
        } else {
          form.link = "https://quill-writer.firebaseapp.com/#/myactivity/" + refName;
        }
      });
    }

    form.addNewWord = function() {
      form.currentForm.wordList.push({})
    }

    form.removeWord = function(wordTup) {
      var index = form.currentForm.wordList.indexOf(wordTup);
      form.currentForm.wordList.splice(index, 1);
    }
  })

;

module.exports = 'sf.form';
