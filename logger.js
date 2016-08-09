var winston = require('winston');

var winston = new (winston.Logger)({  
    transports: [

        new (winston.transports.Console)({ level: 'debug',colorize: true, handleExceptions: true}), //process.env.LOG_LEVEL || 

        /*when logging needs to be done to a log file*/
        /*new (winston.transports.File)({ filename: __dirname + '/../logs/reggie_node.log', level: 'debug' })*/
        new (winston.transports.File)({
            level:'error',
            filename: __dirname + '/logs/error-logs.log',
            handleExceptions: true,
            json: false,        
            maxsize: 5242880, //5MB
            maxFiles: 5, 
            colorize: true 
        })
    ],
    exitOnError: false
});

winston.log('info', 'Initialising logger...');

module.exports = winston;  