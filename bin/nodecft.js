'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getStacks = exports.getOutput = exports.constants = exports.createStack = exports.init = undefined;

var _dotenv = require('dotenv');

var _dotenv2 = _interopRequireDefault(_dotenv);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _logger = require('./utils/logger.util');

var _logger2 = _interopRequireDefault(_logger);

var _util = require('util');

var _child_process = require('child_process');

var _child_process2 = _interopRequireDefault(_child_process);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var exec = (0, _util.promisify)(_child_process2.default.exec);

var _stackOutput = null;

var constants = {
  CAPABILITY_NAMED_IAM: 'CAPABILITY_NAMED_IAM',
  CAPABILITY_IAM: 'CAPABILITY_IAM',
  CAPABILITY_AUTO_EXPAND: 'CAPABILITY_AUTO_EXPAND'
};

var _region = 'us-east-1';

var _getParams = function _getParams(params) {
  var r = _lodash2.default.reduce(params, function (result, value, key) {
    result += 'ParameterKey=' + key + ',ParameterValue="' + value + '"  ';
    return result;
  }, ' ');
  return r;
};

var _getExecOutputJson = function _getExecOutputJson(data) {
  return JSON.parse(data.stdout.replace(/\n|\r/g, ''));
};

var _processStackOutput = function _processStackOutput(data) {
  _stackOutput = _getExecOutputJson(data);
};

/**
 * Get the current user who has logged into the AWS account via CLI
*/
var _getCurrentUserProfile = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
    var cProfile;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return exec('aws opsworks --region ' + _region + ' describe-my-user-profile');

          case 2:
            cProfile = _context.sent;
            return _context.abrupt('return', _lodash2.default.get(_getExecOutputJson(cProfile), 'UserProfile'));

          case 4:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined);
  }));

  return function _getCurrentUserProfile() {
    return _ref.apply(this, arguments);
  };
}();

var init = function init() {
  _dotenv2.default.config();
};

/**
 * @returns All the stacked generated as the CFT execution
 */
var getStacks = function getStacks() {
  return _lodash2.default.get(_stackOutput, 'Stacks');
};

/**
 * Returning the Output param by the given name of the CFT output params
 * @param {String} name // name of the CFT output parameter
 */
var getOutput = function getOutput(name) {
  var outputs = _lodash2.default.get(getStacks(), [0, 'Outputs']);
  return _lodash2.default.get(_lodash2.default.filter(outputs, { OutputKey: name }), [0, 'OutputValue']);
};

/**
 *
 * @param
 * {
    stackName, // Stack Name
    stackPath, // Path of the CFT files in the ./cfts folder on the root folder
    params, // CFT Parameters mapped with ENV param values
    capabilities, // capabilities
    roleArn // roleArn
  } param // CFT Parameters
 * @param {*} isUpdateIfExists
 * @param {*} isUpdate
 */
var createStack = function () {
  var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(_ref3) {
    var stackName = _ref3.stackName,
        stackPath = _ref3.stackPath,
        params = _ref3.params,
        capabilities = _ref3.capabilities,
        roleArn = _ref3.roleArn;
    var isUpdateIfExists = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    var isUpdate = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    var stackTypeMsg, stackType, noUpdatesTobePerformed, cProfile, capb, roln, cmdCreate, cmdWait, cmdDescribe, cmdCreateOut, cmdWaitOut;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            stackTypeMsg = 'Creating the stack';
            stackType = 'create';
            noUpdatesTobePerformed = false;

            if (!isUpdate) {
              _context2.next = 8;
              break;
            }

            stackType = 'update';
            stackTypeMsg = 'Stack already exists, updating the stack';
            _context2.next = 12;
            break;

          case 8:
            _context2.next = 10;
            return _getCurrentUserProfile();

          case 10:
            cProfile = _context2.sent;

            _logger2.default.warn('\n      Your current logged in profile is \n\n      \t |==> ' + _lodash2.default.get(cProfile, 'IamUserArn') + ' \n\n      --------------------------------------------------\n    ');

          case 12:

            // --capabilities CAPABILITY_NAMED_IAM
            capb = capabilities ? '--capabilities ' + capabilities : '';
            roln = roleArn ? '--role-arn ' + roleArn : '';
            cmdCreate = '\n    aws cloudformation --region ' + _region + ' ' + stackType + '-stack       --stack-name ' + stackName + '       --template-body file://' + process.cwd() + '/' + stackPath + '       --parameters ' + _getParams(params) + ' ' + capb + ' ' + roln + '\n    ';
            cmdWait = '\n    aws cloudformation --region ' + _region + ' wait stack-' + stackType + '-complete --stack-name ' + stackName + '\n  ';
            cmdDescribe = '\n  aws cloudformation --region ' + _region + ' describe-stacks --stack-name ' + stackName + '\n';
            _context2.prev = 17;

            _logger2.default.info('\n ' + stackTypeMsg + ' ' + stackName + ' with Params \n ==== \n');
            _logger2.default.info(JSON.stringify(params, undefined, 2));
            _logger2.default.info(cmdCreate);
            _context2.next = 23;
            return exec(cmdCreate);

          case 23:
            cmdCreateOut = _context2.sent;

            _logger2.default.info(JSON.stringify(cmdCreateOut, undefined, 2));
            _context2.next = 41;
            break;

          case 27:
            _context2.prev = 27;
            _context2.t0 = _context2['catch'](17);

            _stackOutput = null;

            if (!(_context2.t0.stderr.indexOf('(AlreadyExistsException)') > -1)) {
              _context2.next = 34;
              break;
            }

            return _context2.abrupt('return', createStack({
              stackName: stackName,
              stackPath: stackPath,
              params: params,
              capabilities: capabilities,
              roleArn: roleArn
            }, false, true));

          case 34:
            if (!(_context2.t0.stderr.indexOf('No updates are to be performed.') > -1)) {
              _context2.next = 39;
              break;
            }

            noUpdatesTobePerformed = true;
            _logger2.default.warn('\n ========= \n | => No updates are to be performed.\n -----------\n');
            _context2.next = 41;
            break;

          case 39:
            _logger2.default.error(_context2.t0);
            throw new Error(_context2.t0);

          case 41:
            if (noUpdatesTobePerformed) {
              _context2.next = 48;
              break;
            }

            _logger2.default.info('\n ========= \n | => Waitign for CFT execution to complete, ' + cmdWait + '-----------\n');
            _context2.next = 45;
            return exec(cmdWait);

          case 45:
            cmdWaitOut = _context2.sent;

            _logger2.default.info(cmdWaitOut);
            _logger2.default.info('\n ========= \n | => CFT execution is completed\n -----------\n');

          case 48:
            _context2.t1 = _processStackOutput;
            _context2.next = 51;
            return exec(cmdDescribe);

          case 51:
            _context2.t2 = _context2.sent;
            (0, _context2.t1)(_context2.t2);
            return _context2.abrupt('return', getStacks());

          case 54:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, undefined, [[17, 27]]);
  }));

  return function createStack(_x) {
    return _ref2.apply(this, arguments);
  };
}();

// /**
//  * To Be impleneted of nested stack support
//  * @param {*} stackName
//  * @param {*} stackPath
//  * @param {*} params
//  * @param {*} capabilities
//  */
// const createNestedStack = async (stackName, stackPath, params, capabilities) => {
//   // @TODO - Tobe implemented
// }

exports.init = init;
exports.createStack = createStack;
exports.constants = constants;
exports.getOutput = getOutput;
exports.getStacks = getStacks;