app.controller('ContactsController', function($scope, $interval, $q, $timeout, $anchorScroll, $uibModal, toaster, APIFactory, cfpLoadingBar){
    /************** functions **************/
    /******* animation launcher *******/
    function _fn_animate_start(element){
        if(_animate_ready){
            _fn_animate_stop();
            _animate_percentage = 0;
            _animate_stop = $interval(function(){
                _animate_percentage += 1;
                if(_animate_percentage >= 100){
                    _fn_animate_stop();
                }
            }, 1);
        }
    }

    function _fn_animate_stop(){
        if(_animate_stop){
            $interval.cancel(_animate_stop);
            _animate_stop = null;    
        }
        _animate_percentage = 100;
    };

    /******* check whether ContactInfo is empty or not *******/
    function _isEmptyContactInfo(contact, phones, addresses){
        if(contact.givenName.trim() == "" && contact.surName.trim() == ""){
            if(phones.length == 0 && addresses.length == 0){
                return true;
            }else{
                var isEmptyPhone = phones.every(function(phone){
                    return phone.phoneNumber.trim() == "";
                });

                var isEmptyAddress = addresses.every(function(phone){
                    return phone.street.trim() == "" && phone.city.trim() == "" && phone.state.trim() == "" && phone.postalCode.trim() == "";
                });

                if(isEmptyAddress && isEmptyPhone){
                    return true;
                }
            }
        }
        return false;
    }

    /************** models **************/
    // mode has one of 'view','edit','add' values.
    // 'viewmode' : displaying "edit" button only
    // 'editmode' : displaying "delete" and "done" button
    var _contact = {
        contactID: null,
        givenName: '',
        surName: ''
    };

    $scope.phoneTypes = [];
    $scope.addressTypes = [];
    $scope.mode = 'view'; // view or edit mode

    $scope.contacts = []; // all contact list
    $scope.addresses = []; // current data is available to modify
    $scope.phones = []; // current data is available to modify

    $scope.selectedIndex = -1; // index for selected contact

    /************** controller **************/
    /******* get animation style without css transition *******/
    var _animate_ready = false, _animate_stop, _animate_percentage = 100;
    $scope.fn_getAnimateStyle = function(){
        if(_animate_ready == false){
            _animate_percentage = 100;
        }

        var transform = -(1.8*_animate_percentage),
            opacity = Math.abs(Math.cos((1.8*_animate_percentage) * Math.PI / 180.0));

        if(opacity == '6.123233995736766e-17'){
            opacity = 0;
        }

        if(_animate_percentage == 100){
            transform = 0;
            opacity = 1;
        }else if(_animate_percentage > 50){
            transform -= 180;
        }
        
        return { 'opacity': opacity, 'transform' : 'rotateZ('+transform+'deg)' };
    };

    /******* scroll to element by using anchor *******/
    $scope.gotoAnchor = function(id) {
        $anchorScroll(id);
    };

    /************** controller : contact **************/
    /******* fn : to retrieve all contact list *******/
    $scope.fn_getAllContact = function(){
        $scope.mode = 'viewmode';

        _animate_ready = false;
        var APIurl = '/contacts';

        APIFactory.get(APIurl).then(function(results){
            if(results && results.status == 200){
                $scope.contacts = results.body;
            }else{
                toaster.pop("error", "", results.message, 5000, 'trustedHtml');
            }
        }, function(results){
            toaster.pop("error", "", results.message, 5000, 'trustedHtml');
        }).finally(function(){
            // check available contact
            if($scope.contacts.length == 0){
                $scope.fn_addContact();
            }else{
                var index = $scope.selectedIndex;
                if(!(index in $scope.contacts)){
                    $scope.selectedIndex = 0;
                }
                $scope.fn_selectContact($scope.selectedIndex);
            }
            _animate_ready = true;
        });
    };

    /******* fn : to add new contact *******/
    $scope.fn_addContact = function(){
        if($scope.mode == 'editmode'){ return false; }
        
        _fn_animate_stop();

        var contact = angular.copy(_contact);
        var idx = $scope.contacts.push(contact);

        $scope.selectedIndex = idx - 1;
        $scope.phones = [];
        $scope.addresses = [];

        $scope.mode = 'editmode';
        $timeout(function(){
            // call anchor for scrolling to new added element
            $scope.gotoAnchor('givenName');
            // focus first input field
            var element = angular.element(document.querySelector('#givenName'));
            if(element && element.length){
                element[0].focus();
            }
        }, 0);
    };

    /******* fn : to select a contact from list *******/
    $scope.fn_selectContact = function($index){
        if($scope.mode == 'editmode'){ return false; }
        
        if($scope.selectedIndex != $index){
            _fn_animate_start();    
        }
        $scope.selectedIndex = $index;
        $scope.phones = [];
        $scope.addresses = [];

        var contact = $scope.contacts[$scope.selectedIndex];
        if(contact.contactID){
            var APIurl = '/contacts/' + contact.contactID;
            
            APIFactory.get(APIurl).then(function(results){
                if(results && results.status == 200){
                    $scope.contacts[$scope.selectedIndex] = results.body;

                    $q.all([
                        APIFactory.get(APIurl + '/phones').then(function(results){
                            if(results && results.status == 200){
                                angular.forEach(results.body.phones, function(data){
                                    var phone = data,
                                        _base = angular.copy(data);

                                    phone._action = '';
                                    phone._base = _base;
                                    $scope.phones.push(phone);
                                });
                            }
                        }), 
                        APIFactory.get(APIurl + '/addresses').then(function(results){
                            if(results && results.status == 200){
                                angular.forEach(results.body.addresses, function(data){
                                    var address = data,
                                        _base = angular.copy(data);

                                    address._action = '';
                                    address._base = _base;
                                    $scope.addresses.push(address);
                                });
                            }
                        })
                    ]).then(function() {
                        $scope.mode = 'viewmode';
                    }, function(results){
                        toaster.pop("error", "", results.message, 5000, 'trustedHtml');
                    });
                }else if(results && results.status == 404){
                    toaster.pop("error", "", "Sorry, this contact could not be found.", 5000, 'trustedHtml');

                    // load all contacts
                    $scope.fn_getAllContact();
                }else{
                    toaster.pop("error", "", results.message, 5000, 'trustedHtml');
                }
            }, function(results){
                toaster.pop("error", "", results.message, 5000, 'trustedHtml');
            });
        }
    };

    /******* fn : to delete a selected contact from list *******/
    $scope.fn_deleteContact = function(){
        var contact = $scope.contacts[$scope.selectedIndex];
        
        var modalInstance = $uibModal.open({
            templateUrl: 'pages/modalConfirm.html',
            controller: 'ModalConfirmController',
            size: 'abs-md',
            resolve: {
                labelMessage: function(){ return 'Are you sure you want to delete the selected Contact?'; },
                labelOk: function(){ return 'Yes (Delete It)'; },
                labelCancel: function(){ return 'No (Keep It)'; }
            }
        });

        modalInstance.result.then(function () {
            if(contact.contactID){
                var APIurl = '/contacts/' + contact.contactID;
        
                APIFactory.delete(APIurl).then(function(results){
                    if(results && results.status == 200){
                        // load all contacts
                        $scope.fn_getAllContact();
                    }else{
                        toaster.pop("error", "", results.message, 5000, 'trustedHtml');
                    }
                }, function(results){
                    toaster.pop("error", "", results.message, 5000, 'trustedHtml');
                });
            }else{
                // load all contacts
                $scope.fn_getAllContact();
            }
        });
    };

    /******* fn : to edit a selected contact from view mode to edit mode *******/
    $scope.fn_editContact = function(){
        if($scope.selectedIndex != -1){
            $scope.mode = 'editmode';
        }
    };

    /******* fn : to save a selected contact *******/
    $scope.fn_doneContact = function(){
        if($scope.selectedIndex != -1){
            // add or update or delete for all phone and address
            function _updateContactInfo(contactID){
                var queues = [];
                var APIurlPhone = "/contacts/" + contactID + "/phones",
                    APIurlAddress = "/contacts/" + contactID + "/addresses",
                    postDataPhone, postDataAddress;

                // make queue for phones
                angular.forEach($scope.phones, function(phone){
                    postDataPhone = {
                        "phoneType": phone.phoneType,
                        "phoneNumber": phone.phoneNumber
                    };

                    // clean up empty phone
                    if(phone.phoneNumber.trim() == ""){
                        if(phone.phoneID){
                            phone._action = 'delete';
                        }else{
                            phone._action = '';
                        }
                    }
                    
                    if(phone._action == 'post'){ // create
                        queues.push(APIFactory.post(APIurlPhone, postDataPhone).then(function(results){
                            if(results && results.status == 200){
                                phone.phoneID = results.body.phoneID;
                            }else{
                                toaster.pop("error", "Phone Add Failed", phone.phoneType + ": " + phone.phoneNumber, 5000, 'trustedHtml');
                            }
                        }));
                    }else if(phone._action == 'put'){ // update
                        queues.push(APIFactory.put(APIurlPhone + '/' + phone.phoneID, postDataPhone).then(function(results){
                            if(results && results.status == 404){
                                toaster.pop("error", "Phone Update Failed", phone.phoneType + ": " + phone.phoneNumber, 5000, 'trustedHtml');
                            }
                        }));
                    }else if(phone._action == 'delete'){ // delete
                        queues.push(APIFactory.delete(APIurlPhone + '/' + phone.phoneID).then(function(results){
                        }));
                    }
                });

                // make queue for addresses
                angular.forEach($scope.addresses, function(address){
                    postDataAddress = {
                        "addressType" : address.addressType,
                        "street" : address.street,
                        "city" : address.city,
                        "state" : address.state,
                        "postalCode" : address.postalCode
                    };

                    // clean up empty address
                    if(address.street.trim() == "" && address.city.trim() == "" && address.state.trim() == "" && address.postalCode.trim() == ""){
                        if(address.addressID){
                            address._action = 'delete';
                        }else{
                            address._action = '';
                        }
                    }

                    // full address string for toaster
                    var address_array = [address.street, address.city, (address.state + ' ' + address.postalCode).trim()],
                        address_string = address_array.filter(function(str){
                            return str != 'undefined' && str.length > 0;
                        }).join(', ');

                    if(address._action == 'post'){ // create
                        queues.push(APIFactory.post(APIurlAddress, postDataAddress).then(function(results){
                            if(results && results.status == 200){
                                address.addressID = results.body.addressID;
                            }else{
                                toaster.pop("error", "", "This Addresss could not be created.\n" + address_string, 5000, 'trustedHtml');
                            }
                        }));
                    }else if(address._action == 'put'){ // update
                        queues.push(APIFactory.put(APIurlAddress + '/' + address.addressID, postDataAddress).then(function(results){
                            if(results && results.status == 404){
                                toaster.pop("error", "", "This Addresss could not be updated.\n" + address_string, 5000, 'trustedHtml');
                            }
                        }));
                    }else if(address._action == 'delete'){ // delete
                        queues.push(APIFactory.delete(APIurlAddress + '/' + address.addressID).then(function(results){
                        }));
                    }
                });

                $q.all(queues).then(function(a) {
                    $scope.mode = 'viewmode';
                    // load all contacts
                    $scope.fn_selectContact($scope.selectedIndex);
                }, function(results){
                    toaster.pop("error", "", results.message, 5000, 'trustedHtml');
                });
            }
            
            var contact = $scope.contacts[$scope.selectedIndex],
                postData = {
                    givenName: contact.givenName,
                    surName: contact.surName
                };
            var isEmpty = _isEmptyContactInfo(contact, $scope.phones, $scope.addresses);
            if(isEmpty){
                if(contact.contactID){
                    var APIurl = '/contacts/' + contact.contactID;
            
                    APIFactory.delete(APIurl).then(function(results){
                        if(results && results.status == 200){
                            // load all contacts
                            $scope.fn_getAllContact();
                        }else{
                            toaster.pop("error", "", results.message, 5000, 'trustedHtml');
                        }
                    }, function(results){
                        toaster.pop("error", "", results.message, 5000, 'trustedHtml');
                    });
                }else{
                    // load all contacts
                    $scope.fn_getAllContact();
                }
            }else{
                if(contact.contactID == null){
                    APIFactory.post('/contacts', postData).then(function(results){
                        if(results && results.status == 200){
                            $scope.contacts[$scope.selectedIndex].contactID = results.body.contactID;
                            _updateContactInfo(results.body.contactID);
                        }
                    }, function(results){
                        toaster.pop("error", "", results.message, 5000, 'trustedHtml');
                    });
                }else{
                    APIFactory.put('/contacts/' + contact.contactID, postData).then(function(results){
                        if(results && results.status == 200){
                            _updateContactInfo(results.body.contactID);
                        }else if(results && results.status == 404){
                            toaster.pop("error", "", "Sorry, this contact could not be found.", 5000, 'trustedHtml');

                            // load all contact [optional]
                            $scope.fn_getAllContact();
                        }
                    }, function(results){
                        toaster.pop("error", "", results.message, 5000, 'trustedHtml');
                    });
                }
            }
        }
    };

    /************** controller : phone **************/
    /******* fn : to open phone-type dropdown *******/
    $scope.fn_toggleDropdownPhone = function($event, phone){
        $event.preventDefault();
        $event.stopPropagation();

        if(phone.isopen == false){
            APIFactory.get('/phone-types').then(function(results){
                $scope.phoneTypes = [];
                if(results && results.status == 200){
                    $scope.phoneTypes = results.body;
                    phone.isopen = true;
                }else{
                    toaster.pop("error", "", "There is no available phone-types.", 10000, 'trustedHtml');
                }
            }, function(results){
                phone.isopen = false;
                toaster.pop("error", "", results.message, 5000, 'trustedHtml');
            });
        }else{
            phone.isopen = false;
        }
    };

    /******* fn : to select phone-type dropdown *******/
    $scope.fn_selectDropdownPhone = function(phone, phoneType){
        phone.phoneType = phoneType;
        if(phone.phoneID && phone._action != 'delete'){ // if the phone has been changed, _action will change to 'put'
            if(phone._base.phoneType != phone.phoneType || phone._base.phoneNumber != phone.phoneNumber){
                phone._action = 'put'; // changed _action as 'put' : need to udpate API
            }else{
                phone._action = ''; // unchanged _action as '' : don't need to udpate API
            }
        }
    };

    /******* fn : to add new phone *******/
    $scope.fn_addPhone = function(){
        APIFactory.get('/phone-types').then(function(results){
            $scope.phoneTypes = [];
            if(results && results.status == 200){
                $scope.phoneTypes = results.body;

                var phone = {
                    phoneID: null,
                    phoneType: $scope.phoneTypes[0],
                    phoneNumber: '',
                    _action: 'post',
                    _base: {
                        phoneType: $scope.phoneTypes[0],
                        phoneNumber: ''
                    }
                };

                var idx = $scope.phones.push(phone);
                $timeout(function(){
                    // call anchor for scrolling to new added element
                    $scope.gotoAnchor('phoneAnchor' + (idx-1));
                    // focus first input field
                    var element = angular.element(document.querySelector('#phoneAnchor' + (idx-1)));
                    if(element && element.length){
                        element[0].focus();
                    }
                }, 0);
            }else{
                toaster.pop("error", "", "There is no available phone-types.", 10000, 'trustedHtml');
            }
        }, function(results){
            toaster.pop("error", "", results.message, 5000, 'trustedHtml');
        });
    };

    /******* fn : to update the phone *******/
    $scope.fn_updatePhone = function($index){
        console.log('fn_updatePhone');
        if($scope.phones[$index].phoneID && $scope.phones[$index]._action != 'delete'){ // if the phone has been changed, _action will change to 'put'
            if($scope.phones[$index]._base.phoneType != $scope.phones[$index].phoneType || $scope.phones[$index]._base.phoneNumber != $scope.phones[$index].phoneNumber){
                $scope.phones[$index]._action = 'put'; // changed _action as 'put' : need to udpate API
            }else{
                $scope.phones[$index]._action = ''; // unchanged _action as '' : don't need to udpate API
            }
        }
    };

    /******* fn : to delete the phone *******/
    $scope.fn_deletePhone = function($event, $index){
        $event.stopPropagation();
        if($scope.phones[$index].phoneID){
            $scope.phones[$index]._action = 'delete'; // changed _action as 'delete' if the phone has id.
        }else{
            $scope.phones.splice($index, 1); // deleted the phone because it doesn't need to call API.
        }
    };

    /************** controller : address **************/
    /******* fn : to open address-type dropdown *******/
    $scope.fn_toggleDropdownAddress = function($event, address){
        $event.preventDefault();
        $event.stopPropagation();

        if(address.isopen == false){
            APIFactory.get('/address-types').then(function(results){
                $scope.addressTypes = [];
                if(results && results.status == 200){
                    $scope.addressTypes = results.body;
                    address.isopen = true;
                }else{
                    toaster.pop("error", "", "There is no available address-type.", 10000, 'trustedHtml');
                }
            }, function(results){
                address.isopen = false;
                toaster.pop("error", "", results.message, 5000, 'trustedHtml');
            });
        }else{
            address.isopen = false;
        }
    };

    /******* fn : to select address-type dropdown *******/
    $scope.fn_selectDropdownAddress = function(address, addressType){
        address.addressType = addressType;
        if(address.addressID && address._action != 'delete'){ // if the address has been changed, _action will change to 'put'
            if(address._base.addressType != address.addressType || 
                address._base.street != address.street || 
                address._base.city != address.city || 
                address._base.state != address.state || 
                address._base.postalCode != address.postalCode){
                address._action = 'put'; // changed _action as 'put' : need to udpate API
            }else{
                address._action = ''; // unchanged _action as '' : don't need to udpate API
            }
        }
    };

    /******* fn : to add the address *******/
    $scope.fn_addAddress = function(){
        APIFactory.get('/address-types').then(function(results){
            $scope.addressTypes = [];
            if(results && results.status == 200){
                $scope.addressTypes = results.body;

                var address = {
                    addressType: $scope.addressTypes[0],
                    street: '',
                    city: '',
                    state: '',
                    postalCode: '',
                    _action: 'post', // default _action is 'post' to call API
                    _base: { // save _base is initial data
                        addressType: $scope.addressTypes[0],
                        street: '',
                        city: '',
                        state: '',
                        postalCode: '',
                    }
                };

                var idx = $scope.addresses.push(address);
                $timeout(function(){
                    // call anchor for scrolling to new added element
                    $scope.gotoAnchor('addressAnchor' + (idx-1));
                    // focus first input field
                    var element = angular.element(document.querySelector('#addressAnchor' + (idx-1)));
                    if(element && element.length){
                        element[0].focus();
                    }
                }, 0);
            }else{
                toaster.pop("error", "", "There is no available address-type.", 10000, 'trustedHtml');
            }
        }, function(results){
            toaster.pop("error", "", results.message, 5000, 'trustedHtml');
        });
    };

    /******* fn : to updated the address *******/
    $scope.fn_updateAddress = function($index){
        console.log('fn_updateAddress : ');
        if($scope.addresses[$index].addressID && $scope.addresses[$index]._action != 'delete'){ // if the address has been changed, _action will change to 'put'
            if($scope.addresses[$index]._base.addressType != $scope.addresses[$index].addressType || 
                $scope.addresses[$index]._base.street != $scope.addresses[$index].street || 
                $scope.addresses[$index]._base.city != $scope.addresses[$index].city || 
                $scope.addresses[$index]._base.state != $scope.addresses[$index].state || 
                $scope.addresses[$index]._base.postalCode != $scope.addresses[$index].postalCode){
                $scope.addresses[$index]._action = 'put'; // changed _action as 'put' : need to udpate API
            }else{
                $scope.addresses[$index]._action = ''; // unchanged _action as '' : don't need to udpate API
            }
        }
    };

    /******* fn : to delete the address *******/
    $scope.fn_deleteAddress = function($event, $index){
        $event.stopPropagation();
        if($scope.addresses[$index].addressID){
            $scope.addresses[$index]._action = 'delete'; // changed _action as 'delete' if the address has id.
        }else{
            $scope.addresses.splice($index, 1); // deleted the address because it doesn't need to call API.
        }
    };

    /************** initialize **************/
    /******* initialize : to display loading spinner *******/
    cfpLoadingBar.start();

    /******* initialize : to wait until APIFactory is ready *******/
    APIFactory.getReady().then(function(){ // APIFactory load config.json file and set up the RestAPI host and port
        cfpLoadingBar.complete();

        /******* initialize : to support transition on input *******/
        $scope.fn_getAllContact();
    });
});