
import { init, constants, getOutput, createStack } from '../nodecft';
import AWS from 'aws-sdk';
import fs from 'fs';

describe('Test NodeCFT', () => {
  test('createStack should should execute without any issue', async () => {

    process.env.RESOURCE_PREFIX = 'NODECF-BOILERPLATE-';
    process.env.RESOURCE_POSTFIX = '--V2-TEST';

    const params = {
      ResourcePrefix: process.env.RESOURCE_PREFIX,
      ResourcePostfix: process.env.RESOURCE_POSTFIX
    }

    try {
      // Creat and Update the Stack
      await createStack({
        // Stack Name that can be used to Identify the Stack in the AWS couldformation console
        stackName: `${process.env.RESOURCE_PREFIX}IamRole${process.env.RESOURCE_POSTFIX}`,
        // Path of the local CFT file in the CFTS folder
        stackPath: 'src/_fixtures/cfts/iam-role.yaml',
        // Map the parameters in the CFT file
        params: {
          ...params,
          RoleName: `IamRole${process.env.RESOURCE_POSTFIX}-v10`
        },
        capabilities: constants.CAPABILITY_NAMED_IAM
      }, true)
      console.log('Test 2');

      console.log(`
      Output
        RoleName => ${getOutput('RoleName')}
        RoleArn => ${getOutput('RoleArn')}
      `)
    } catch (e) {
      console.log('Error! => ', e)
    }
  })
})
