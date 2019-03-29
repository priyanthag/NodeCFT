import AWS from 'aws-sdk'
import dotenv from 'dotenv'
import _ from 'lodash'
import fs from 'fs'

import logger from './utils/logger.util'
import { createHash, isNullOrEmptyOrUndefined } from './utils/misc.util'
import { _getProcessStackOutput } from './nodecft.sub'

let _originalStackResponse = null
let _stackOutput = null

const constants = {
  CAPABILITY_NAMED_IAM: 'CAPABILITY_NAMED_IAM',
  CAPABILITY_IAM: 'CAPABILITY_IAM',
  CAPABILITY_AUTO_EXPAND: 'CAPABILITY_AUTO_EXPAND'
}

const _region = 'us-east-1'

const _getParams = (params) => {
  const r = _.reduce(params, (result, value, key) => {
    result.push({
      ParameterKey: key,
      ParameterValue: value
    })
    return result
  }, [])
  return r
}

const _processStackResponse = (data) => {
  _originalStackResponse = data
  _stackOutput = _getProcessStackOutput(data)
}

/**
 * Get the current user who has logged into the AWS account via CLI
*/
const _getCurrentUserProfile = async () => {
  var iam = new AWS.IAM()
  const usr = await iam.getUser().promise()
  return {
    User: _.get(usr, 'User'),
    IamUserArn: _.get(usr, ['User', 'Arn'])
  }
}

const init = () => {
  dotenv.config()
}

const _prepareSdkParams = (iParams, isUpdate) => {
  const rParams = {
    StackName: iParams.stackName, /* required */
    TemplateBody: fs.readFileSync(`${process.cwd()}/${iParams.stackPath}`, 'utf8')
  }

  if (iParams.capabilities) {
    _.set(rParams, 'Capabilities', [
      iParams.capabilities
    ])
  }

  if (iParams.roleArn) {
    _.set(rParams, 'RoleARN', [
      iParams.roleArn
    ])
  }

  if (iParams.params) {
    _.set(rParams, 'Parameters', _getParams(iParams.params))
  }

  // only create stack must use these params
  if (isUpdate === false) {
    _.set(rParams, 'DisableRollback', true)
    _.set(rParams, 'EnableTerminationProtection', false)
  }
  _.set(rParams, 'ClientRequestToken', createHash(rParams))

  return rParams
}

/**
 * @returns All the stacked generated as the CFT execution
 */
const getStacks = () => {
  return _originalStackResponse
}

/**
 * Returning the Output param by the given name of the CFT output params
 * @param {String} name // name of the CFT output parameter
 */
const getOutput = (name) => {
  if (isNullOrEmptyOrUndefined(name)) {
    return _stackOutput
  } else {
    return _.get(_stackOutput, name)
  }
}

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
const createStack = async ({
  stackName,
  stackPath,
  params,
  capabilities,
  roleArn
}, isUpdateIfExists = false, isUpdate = false) => {
  const sdkParams = _prepareSdkParams({
    stackName,
    stackPath,
    params,
    capabilities,
    roleArn
  }, isUpdate)

  let stackTypeMsg = 'Creating the stack'
  let waitingFor = null

  // populating CLI messages
  if (isUpdate) {
    stackTypeMsg = 'Stack already exists, updating the stack'
  } else {
    const cProfile = await _getCurrentUserProfile()
    logger.warn(`Your current logged in profile is [ ${_.get(cProfile, 'IamUserArn')} ] \n`)
  }

  AWS.config.update({ region: _region })
  AWS.config.apiVersions = {
    cloudformation: '2010-05-15'
  }
  var cloudformation = new AWS.CloudFormation()

  try {
    logger.info(`${stackTypeMsg} ${stackName} with following stack parameters \n ${JSON.stringify({
      ...sdkParams,
      TemplateBody: `Check the Yaml file at [${stackPath}]`
    }, undefined, 2)}`)
    if (isUpdate) {
      // update
      waitingFor = 'stackUpdateComplete'
      await cloudformation.updateStack(sdkParams).promise()
    } else {
      // create
      waitingFor = 'stackCreateComplete'
      await cloudformation.createStack(sdkParams).promise()
    }

    const stCompleteRes = await new Promise((resolve, reject) => {
      cloudformation.waitFor(waitingFor, {
        StackName: stackName
      }, (err, data) => {
        if (err) {
          return reject(err)
        }
        return resolve(data)
      })
    })

    _processStackResponse(stCompleteRes)
  } catch (e) {
    // if the AlreadyExistsException:, update the stack
    if (e.code === 'AlreadyExistsException') {
      if (!isUpdateIfExists) {
        logger.warn(`Stack updating is denied by the user`)
        const dStack = await cloudformation.describeStacks({
          StackName: stackName
        }).promise()
        _processStackResponse(dStack)
      } else {
        return createStack({
          stackName,
          stackPath,
          params,
          capabilities,
          roleArn
        }, false, true)
      }
    } else {
      logger.error(e)
      throw e
    }
  }
}

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

export {
  init,
  createStack,
  constants,
  getOutput,
  getStacks
}
