var express = require('express');
var router = express.Router();
var data = require('../models/Data');
var errormsg = require('../errormsg');
var utils = require('../utils');

router.route('/')
	.get(function(req, res){
		data.selectAllAddressType(function(err, result){
			if(err){
				utils.sendFailResponse(res, err);
			}else{
				res.json({
					"status" : 200,
					"body": result,
					"message" : "Address-type list fetched successfully."
				});
			}
		});
	})

module.exports = router;