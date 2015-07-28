'use strict';

angular
  .module('spinnaker.editApplication.modal.controller',[
    'spinnaker.applications.write.service',
    'ui.router',
    'spinnaker.utils.lodash',
  ])
  .controller('EditApplicationController', function ($window, $state, application, $modalInstance, applicationWriter, _) {
    var vm = this;
    vm.submitting = false;
    vm.errorMsgs = [];
    vm.application = application;
    vm.applicationAttributes = _.cloneDeep(application.attributes);

    function closeModal() {
      $modalInstance.close(vm.applicationAttributes);
    }

    function extractErrorMsg(error) {
      var exceptions = _.chain(error.variables)
        .where({key: 'exception'})
        .first()
        .value()
        .value
        .details
        .errors;

      angular.copy(exceptions, vm.errorMsgs );
      assignErrorMsgs();
      goIdle();
    }

    function assignErrorMsgs() {
      vm.emailErrorMsg = vm.errorMsgs.filter(function(msg){
        return msg
            .toLowerCase()
            .indexOf('email') > -1;
      });
    }

    function goIdle() {
      vm.submitting = false;
    }

    function submitting() {
      vm.submitting = true;
    }

    vm.clearEmailMsg = function() {
      vm.emailErrorMsg = '';
    };

    vm.submit = function () {
      submitting();

      applicationWriter.updateApplication(vm.applicationAttributes)
        .then(
          function(taskResponseList) {
            _.first(taskResponseList)
              .watchForTaskComplete()
              .then(
                closeModal,
                extractErrorMsg
              );
          },
          function() {
            vm.errorMsgs.push('Could not update application');
          }
        );
    };

    return vm;
  });

