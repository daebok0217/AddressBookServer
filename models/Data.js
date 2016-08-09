var uuid = require('uuid');
var types = require('../types');
var logger = require('../logger');
var errormsg = require('../errormsg');
var utils = require('../utils');

var contacts = [];
var addresses = [];
var phones = [];

// select all contacts
exports.selectAllContacts = function(callback){
	try {
		callback(null, contacts);
	}
	catch (err) {
		logger.log("error",__filename + " Error while fetching all contacts " ,{error :err.message});
		callback(new Error(errormsg.BAD_REQUEST));
	}
};

// select a contact
exports.selectContactByID = function(contactID, callback){
	try {
		var contact = contacts.filter(function(contact){
			return contact.contactID == contactID;
		});
		callback(null, contact);
	}
	catch (err) {
		logger.log("error",__filename + " Error while fetching contact : " + contactID ,{error :err.message});
		callback(new Error(errormsg.BAD_REQUEST));
	}
};

// create new contact
exports.createContact = function(givenName, surName, callback){
	try {
		var contact = {
			contactID: uuid.v4(),
			givenName: givenName,
			surName: surName
		}
		contacts.push(contact);
		callback(null, contact);
	}
	catch (err) {
		logger.log("error",__filename + " Error while creating contact" ,{error :err.message});
		callback(new Error(errormsg.BAD_REQUEST));
	}	
};

// update the contact
exports.updateContact = function(contactID, givenName, surName, callback){
	try {
		var result = null;
		for(var i = 0, len = contacts.length; i < len ; i++){
			if(contacts[i].contactID == contactID){
				contacts[i].givenName = givenName;
				contacts[i].surName = surName;
				result = contacts[i];
				break;
			}
		}
		callback(null, result);
	}
	catch (err) {
		logger.log("error",__filename + " Error while updating contact : " + contactID ,{error :err.message});
		callback(new Error(errormsg.BAD_REQUEST));
	}
};

// delete the contact
exports.deleteContact = function(contactID, callback){
	try {
		contacts = contacts.filter(function(contact){
			return contact.contactID !== contactID;
		});
		callback(null, null);
	}
	catch (err) {
		logger.log("error",__filename + " Error while deleting contact : " + contactID ,{error :err.message});
		callback(new Error(errormsg.BAD_REQUEST));
	}
};

// select all address-types
exports.selectAllAddressType = function(callback){
	try {
		callback(null, types.addressTypes);
	}
	catch (err) {
		logger.log("error",__filename + " Error while fetching address-types" ,{error :err.message});
		callback(new Error(errormsg.BAD_REQUEST));
	}
};

// select the address
exports.selectAddressesByID = function(contactID, callback){
	try {
		var result = addresses.filter(function(address){
			return address.contactID == contactID;
		});
		callback(null, result);
	}
	catch (err) {
		logger.log("error",__filename + " Error while fetching addresses : " + contactID ,{error :err.message});
		callback(new Error(errormsg.BAD_REQUEST));
	}
};

// create new address
exports.createAddressForContact = function(contactID, addressType, street, city, state, postalCode, callback){
	try {
		var result = {
			contactID: contactID,
			addressType: addressType,
			addressID: uuid.v4(),
			street: street,
			city: city,
			state: state,
			postalCode: postalCode
		};
		addresses.push(result);
		callback(null, result);
	}
	catch (err) {
		logger.log("error",__filename + " Error while creating address : " + contactID ,{error :err.message});
		callback(new Error(errormsg.BAD_REQUEST));
	}
};

// update the address
exports.updateAddressForContact = function(contactID, addressID, addressType, street, city, state, postalCode, callback){
	try {
		var result = null;
		for(var i = 0, len = addresses.length; i < len ; i++){
			if(addresses[i].contactID == contactID && addresses[i].addressID == addressID){
				addresses[i].addressType = addressType;
				addresses[i].street = street;
				addresses[i].city = city;
				addresses[i].state = state;
				addresses[i].postalCode = postalCode;

				result = addresses[i];
				break;
			}
		}

		callback(null, result);
	}
	catch (err) {
		logger.log("error",__filename + " Error while updating address : " + contactID + " addressID : " + addressID ,{error :err.message});
		callback(new Error(errormsg.BAD_REQUEST));
	}
};

// delete the address
exports.deleteAddressByID = function(contactID, addressID, callback){
	try {
		addresses = addresses.filter(function(address){
			return !(address.contactID === contactID && address.addressID === addressID);
		});
		callback(null, null);
	}
	catch (err) {
		logger.log("error",__filename + " Error while deleting address : " + contactID + " addressID : " + addressID ,{error :err.message});
		callback(new Error(errormsg.BAD_REQUEST));
	}
};

// delete all addresses
exports.deleteAllAddressByID = function(contactID, callback){
	try {
		addresses = addresses.filter(function(address){
			return address.contactID !== contactID;
		});
		logger.log('Method : deleteAllAddressByID ', contactID);
		callback(null, null);
	}
	catch (err) {
		logger.log("error",__filename + " Error while deleting addresses : " + contactID ,{error :err.message});
		callback(new Error(errormsg.BAD_REQUEST));
	}
};

// select all phone-types
exports.selectAllPhoneType = function(callback){
	try {
		callback(null, types.phoneTypes);
	}
	catch (err) {
		logger.log("error",__filename + " Error while fetching phone-types" ,{error :err.message});
		callback(new Error(errormsg.BAD_REQUEST));
	}
};

// select the phone
exports.selectPhoneByID = function(contactID, callback){
	try {
		var result = phones.filter(function(phone){
			return phone.contactID == contactID;
		});
		callback(null, result);
	}
	catch (err) {
		logger.log("error",__filename + " Error while fetching phones : " + contactID ,{error :err.message});
		callback(new Error(errormsg.BAD_REQUEST));
	}
};

// create new phone
exports.createPhoneForContact = function(contactID, phoneType, phoneNumber, callback){
	try {
		var result = {
			contactID: contactID,
			phoneID : uuid.v4(),
			phoneType: phoneType,
			phoneNumber: phoneNumber
		};

		phones.push(result);
		callback(null, result);
	}
	catch (err) {
		logger.log("error",__filename + " Error while creating phone : " + contactID ,{error :err.message});
		callback(new Error(errormsg.BAD_REQUEST));
	}
};

// update the phone
exports.updatePhoneForContact = function(contactID, phoneID, phoneType, phoneNumber, callback){
	try {
		var result = null;
		for(var i = 0, len = phones.length; i < len ; i++){
			if(phones[i].contactID == contactID && phones[i].phoneID == phoneID){
				phones[i].phoneType = phoneType;
				phones[i].phoneNumber = phoneNumber;

				result = phones[i];
				break;
			}
		}
		callback(null, result);
	}
	catch (err) {
		logger.log("error",__filename + " Error while updating phone : " + contactID + " phoneID : " + phoneID ,{error :err.message});
		callback(new Error(errormsg.BAD_REQUEST));
	}
};

// delete the phone
exports.deletePhoneByID = function(contactID, phoneID, callback){
	try {
		phones = phones.filter(function(phone){
			return !(phone.contactID === contactID && phone.phoneID === phoneID);
		});
		callback(null, null);
	}
	catch (err) {
		logger.log("error",__filename + " Error while deleting phone : " + contactID + " phoneID : " + phoneID ,{error :err.message});
		callback(new Error(errormsg.BAD_REQUEST));
	}
};

// select all phones
exports.deleteAllPhoneByID = function(contactID, callback){
	try {
		addresses = addresses.filter(function(phone){
			return address.contactID !== contactID;
		});
		callback(null, null);
	}
	catch (err) {
		logger.log("error",__filename + " Error while deleting phones : " + contactID ,{error :err.message});
		callback(new Error(errormsg.BAD_REQUEST));
	}
};