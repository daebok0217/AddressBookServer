app.controller('ModalConfirmController', function ($scope, $uibModalInstance, labelMessage, labelOk, labelCancel) {
	/************** labels **************/
    $scope.labelMessage = labelMessage || "Are you sure you want to this?";
    $scope.labelOk = labelOk || "Yes";
    $scope.labelCancel = labelCancel || "No";
    /************** controllers **************/
    $scope.ok = function () {
        $uibModalInstance.close();
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
});