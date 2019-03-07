import dotenv from 'dotenv'
import _ from 'lodash'
import logger from './utils/logger.util'
import { promisify } from 'util'
import childProcess from 'child_process'

const exec = promisify(childProcess.exec)

let _stackOutput = null

const constants = {
  CAPABILITY_NAMED_IAM: 'CAPABILITY_NAMED_IAM',
  CAPABILITY_IAM: 'CAPABILITY_IAM',
  CAPABILITY_AUTO_EXPAND: 'CAPABILITY_AUTO_EXPAND'
}

const _region = 'us-east-1'

const _getParams = (params) => {
  const r = _.reduce(params, (result, value, key) => {
    result += `ParameterKey=${key},ParameterValue="${value}"  `
    return result
  }, ' ')
  return r
}

const _getExecOutputJson = (data) => {
  return JSON.parse(data.stdout.replace(/\n|\r/g, ''))
}

const _processStackOutput = (data) => {
  _stackOutput = _getExecOutputJson(data)
}

/**
 * Get the current user who has logged into the AWS account via CLI
*/
const _getCurrentUserProfile = async () => {
  const cProfile = await exec(`aws opsworks --region ${_region} describe-my-user-profile`)
  return _.get(_getExecOutputJson(cProfile), 'UserProfile')
}

const init = () => {
  dotenv.config()
}

/**
 * @returns All the stacked generated as the CFT execution
 */
const getStacks = () => {
  return _.get(_stackOutput, 'Stacks')
}

/**
 * Returning the Output param by the given name of the CFT output params
 * @param {String} name // name of the CFT output parameter
 */
const getOutput = (name) => {
  const outputs = _.get(getStacks(), [0, 'Outputs'])
  return _.get(_.filter(outputs, { OutputKey: name }), [0, 'OutputValue'])
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
  let stackTypeMsg = 'Creating the stack'
  let stackType = 'create'
  let noUpdatesTobePerformed = false
  if (isUpdate) {
    stackType = 'update'
    stackTypeMsg = 'Stack already exists, updating the stack'
  } else {
    const cProfile = await _getCurrentUserProfile()
    logger.warn(`
      Your current logged in profile is \n
      \t |==> ${_.get(cProfile, 'IamUserArn')} \n
      --------------------------------------------------
    `)
  }

  // --capabilities CAPABILITY_NAMED_IAM
  let capb = capabilities ? `--capabilities ${capabilities}` : ''
  let roln = roleArn ? `--role-arn ${roleArn}` : ''

  const cmdCreate = `
    aws cloudformation --region ${_region} ${stackType}-stack \
      --stack-name ${stackName} \
      --template-body file://${process.cwd()}/${stackPath} \
      --parameters ${_getParams(params)} ${capb} ${roln}
    `
  const cmdWait = `
    aws cloudformation --region ${_region} wait stack-${stackType}-complete --stack-name ${stackName}
  `

  const cmdDescribe = `
  aws cloudformation --region ${_region} describe-stacks --stack-name ${stackName}
`
  try {
    logger.info(`\n ${stackTypeMsg} ${stackName} with Params \n ==== \n`)
    logger.info(JSON.stringify(params, undefined, 2))
    logger.info(cmdCreate)
    const cmdCreateOut = await exec(cmdCreate)
    logger.info(JSON.stringify(cmdCreateOut, undefined, 2))
  } catch (e) {
    _stackOutput = null

    if (e.stderr.indexOf('(AlreadyExistsException)') > -1) {
      // update the stack as its already existing
      return createStack({
        stackName,
        stackPath,
        params,
        capabilities,
        roleArn
      }, false, true)
    } else {
      // if nothing to update continue the rest
      if (e.stderr.indexOf('No updates are to be performed.') > -1) {
        noUpdatesTobePerformed = true
        logger.warn('\n ========= \n | => No updates are to be performed.\n -----------\n')
      } else {
        logger.error(e)
        throw new Error(e)
      }
    }
  }
  // wait till everything finishes
  if (!noUpdatesTobePerformed) {
    logger.info(`\n ========= \n | => Waitign for CFT execution to complete, ${cmdWait}-----------\n`)
    const cmdWaitOut = await exec(cmdWait)
    logger.info(JSON.stringify(cmdWaitOut, undefined, 2))
    logger.info(`\n ========= \n | => CFT execution is completed\n -----------\n`)
  }

  // Process the initial stack created by the CFT execution
  _processStackOutput(await exec(cmdDescribe))
  return getStacks()
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
