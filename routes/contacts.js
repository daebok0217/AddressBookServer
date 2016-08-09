var express = require('express');
var router = express.Router();
var async = require('async');
var data = require('../models/Data');
var errormsg = require('../errormsg');
var utils = require('../utils');

router.route('/')
	.get(function(req, res){
		data.selectAllContacts(function(err, result){
			if(err){
				utils.sendFailResponse(res, err);
			}else{
				res.json({
					"status" : 200,
					"body": result,
					"message" : "Contacts list fetched successfully."
				});
			}
		});
	})

router.route('/:contactid')
	.get(function(req,res){
		var contactID = req.params.contactid;
		data.selectContactByID(contactID, function(err, result){
			if(err){
				utils.sendFailResponse(res, err);
			}else{
				if(result && result.length){
					res.json({
						"status" : 200,
						"body":{
							"contactID" : result[0].contactID,
							"givenName" : result[0].givenName,
							"surName" : result[0].surName
						},
						"message" : "Contact fetched successfully."
					});
				}else{
					err = {
						code:404,
						message: errormsg.NOT_FOUND
					};
					utils.sendFailResponse(res, err);
				}
			}
		});	
	})

router.route('/')
	.post(function(req, res) {
		var reqJSON = req.body;
		var givenName = reqJSON.givenName;
		var surName = reqJSON.surName;

		data.createContact(givenName, surName, function(err, result){
			if(err){
				utils.sendFailResponse(res, err);
			}else{
				if(result){
					res.json({
						"status" : 200,
						"body":{
							"contactID" : result.contactID,
							"givenName" : result.givenName,
							"surName" : result.surName
						},
						"message" : "Contact created successfully."
					});
				}else{
					err = {
						code:404,
						message: errormsg.NOT_FOUND
					};
					utils.sendFailResponse(res, err);
				}
			}
		});	
	})

router.route('/:contactid')
	.put(function(req, res) {
		var contactID = req.params.contactid;
		var reqJSON = req.body;
		var givenName = reqJSON.givenName;
		var surName = reqJSON.surName;
		data.updateContact(contactID, givenName, surName, function(err, result){
			if(err){
				utils.sendFailResponse(res, err);
			}else{
				if(result){
					res.json({
						"status" : 200,
						"body":{
							"contactID" : result.contactID,
							"givenName" : result.givenName,
							"surName" : result.surName
						},
						"message" : "Contact updated successfully."
					});
				}else{
					err = {
						code:404,
						message: errormsg.NOT_FOUND
					};
					utils.sendFailResponse(res, err);
				}
			}
		});	
	})

router.route('/:contactid')
	.delete(function(req, res) {
		var contactID = req.params.contactid;
		async.waterfall([
			function(callback) {
				data.deleteContact(contactID, function(err, result){
					callback(err);
				});
			},
			function(callback) {
				data.deleteAllAddressByID(contactID, function(err, result){
					callback(err);
				});
			},
			function(callback) {
				data.deleteAllPhoneByID(contactID, function(err, result){
					callback(err);
				});
			}], function(err, result){
				res.json({
					"status" : 200,
					"body":{},
					"message" : "Contact deleted successfully."
				});
			});
	})

router.route('/:contactid/addresses')
	.get(function(req,res){
		var contactID = req.params.contactid;
		data.selectAddressesByID(contactID, function(err, result){
			if(err){
				utils.sendFailResponse(res, err);
			}else{
				if(result && result.length){
					res.json({
						"status" : 200,
						"body":{
							"addresses" : result
						},
						"message" : "Addresses fetched successfully."
					});
				}else{
					err = {
						code:404,
						message: errormsg.NOT_FOUND
					};
					utils.sendFailResponse(res, err);
				}
			}
		});	
	})

router.route('/:contactid/addresses')
	.post(function(req, res) {
		var contactID = req.params.contactid;
		var reqJSON = req.body;
		var addressType = reqJSON.addressType;
		var street = reqJSON.street;
		var city = reqJSON.city;
		var state = reqJSON.state;
		var postalCode = reqJSON.postalCode;
		data.createAddressForContact(contactID, addressType, street, city, state, postalCode, function(err, result){
			if(err){
				utils.sendFailResponse(res, err);
			}else{
				if(result){
					res.json({
						"status" : 200,
						"body":{
							"addressID" : result.addressID,
							"addressType" : result.addressType,
							"street" : result.street,
							"city" : result.city,
							"state" : result.state,
							"postalCode" : result.postalCode
						},
						"message" : "Address created successfully."
					});
				}else{
					err = {
						code:404,
						message: errormsg.NOT_FOUND
					};
					utils.sendFailResponse(res, err);
				}
			}
		});	
	})

router.route('/:contactid/addresses/:addressid')
	.put(function(req, res) {
		var contactID = req.params.contactid;
		var addressID = req.params.addressid;
		var reqJSON = req.body;
		var addressType = reqJSON.addressType;
		var street = reqJSON.street;
		var city = reqJSON.city;
		var state = reqJSON.state;
		var postalCode = reqJSON.postalCode;
		data.updateAddressForContact(contactID, addressID, addressType, street, city, state, postalCode, function(err, result){
			if(err){
				utils.sendFailResponse(res, err);
			}else{
				if(result){
					res.json({
						"status" : 200,
						"body":{
							"addressID" : result.addressID,
							"addressType" : result.addressType,
							"street" : result.street,
							"city" : result.city,
							"state" : result.state,
							"postalCode" : result.postalCode
						},
						"message" : "Address updated successfully."
					});
				}else{
					err = {
						code:404,
						message: errormsg.NOT_FOUND
					};
					utils.sendFailResponse(res, err);
				}
			}
		});	
	})

router.route('/:contactid/addresses/:addressid')
	.delete(function(req, res) {
		var contactID = req.params.contactid;
		var addressID = req.params.addressid;
		data.deleteAddressByID(contactID, addressID, function(err, result){
			if(err){
				utils.sendFailResponse(res, err);
			}else{
				res.json({
					"status" : 200,
					"body":{},
					"message" : "Address deleted successfully."
				});
			}
		});	
	})

router.route('/:contactid/phones')
	.get(function(req,res){
		var contactID = req.params.contactid;
		data.selectPhoneByID(contactID, function(err, result){
			if(err){
				utils.sendFailResponse(res, err);
			}else{
				if(result && result.length){
					res.json({
						"status" : 200,
						"body":{
							"phones" : result
						},
						"message" : "Phone number list fetched successfully."
					});
				}else{
					err = {
						code:404,
						message: errormsg.NOT_FOUND
					};
					utils.sendFailResponse(res, err);
				}
			}
		});	
	})

router.route('/:contactid/phones')
	.post(function(req, res) {
		var contactID = req.params.contactid;
		var reqJSON = req.body;
		var phoneType = reqJSON.phoneType;
		var phoneNumber = reqJSON.phoneNumber;
		data.createPhoneForContact(contactID, phoneType, phoneNumber, function(err, result){
			if(err){
				utils.sendFailResponse(res, err);
			}else{
				if(result){
					res.json({
						"status" : 200,
						"body":{
							"phoneID" : result.phoneID,
							"phoneType" : result.phoneType,
							"phoneNumber" : result.phoneNumber
						},
						"message" : "Phone number created successfully."
					});
				}else{
					err = {
						code:404,
						message: errormsg.NOT_FOUND
					};
					utils.sendFailResponse(res, err);
				}
			}
		});	
	})

router.route('/:contactid/phones/:phoneid')
	.put(function(req, res) {
		var contactID = req.params.contactid;
		var phoneID = req.params.phoneid;
		var reqJSON = req.body;
		var phoneType = reqJSON.phoneType;
		var phoneNumber = reqJSON.phoneNumber;
		data.updatePhoneForContact(contactID, phoneID, phoneType, phoneNumber, function(err, result){
			if(err){
				utils.sendFailResponse(res, err);
			}else{
				if(result){
					res.json({
						"status" : 200,
						"body":{
							"phoneID" : result.phoneID,
							"phoneType" : result.phoneType,
							"phoneNumber" : result.phoneNumber
						},
						"message" : "Phone number updated successfully."
					});
				}else{
					err = {
						code:404,
						message: errormsg.NOT_FOUND
					};
					utils.sendFailResponse(res, err);
				}
			}
		});	
	})

router.route('/:contactid/phones/:phoneid')
	.delete(function(req, res) {
		var contactID = req.params.contactid;
		var phoneID = req.params.phoneid;
		data.deletePhoneByID(contactID, phoneID, function(err, result){
			if(err){
				utils.sendFailResponse(res, err);
			}else{
				res.json({
					"status" : 200,
					"body":{},
					"message" : "Phone number deleted successfully."
				});
			}
		});	
	})

module.exports = router;