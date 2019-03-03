'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _winston = require('winston');

var _winston2 = _interopRequireDefault(_winston);

require('winston-daily-rotate-file');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var LOG_DIR = process.env.LOG_DIR || 'logs';
var LOG_LEVEL = process.env.LOG_LEVEL || 'info';

// Create logs directory if it does not exist
if (!_fs2.default.existsSync(LOG_DIR)) {
  _fs2.default.mkdirSync(LOG_DIR);
}

var logger = _winston2.default.createLogger({
  transports: [new _winston2.default.transports.Console({
    format: _winston.format.combine(_winston.format.colorize(), _winston.format.simple()),
    level: LOG_LEVEL
  }), new _winston2.default.transports.DailyRotateFile({
    format: _winston.format.combine(_winston.format.timestamp(), _winston.format.json()),
    maxFiles: '14d',
    dirname: LOG_DIR,
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    filename: '%DATE%-log.log',
    level: LOG_LEVEL
  })]
});

exports.default = logger;