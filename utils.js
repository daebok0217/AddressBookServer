exports.clone = function(data){
  return JSON.parse(JSON.stringify(a));
}

exports.sendFailResponse = function(res, error){
	res.status(error.code || 400).json(
		{
			"status" : error.code || 400,
			"body" : {},
			"message" : error.message
		}
	);
}