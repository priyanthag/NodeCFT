const CREATE_COMPLETE_RESPONSE = {
  'ResponseMetadata': {
    'RequestId': 'e5e6f45f-4ff9-11e9-90c1-e5e6f45f'
  },
  'Stacks': [
    {
      'StackId': 'arn:aws:cloudformation:us-east-1:840742628714:stack/NODECF-BOILERPLATE-IamRole-V2/c17a9cc0-4ff9-11e9-84a2-0ec3f5318aae',
      'StackName': 'NODECF-BOILERPLATE-IamRole-V2',
      'Description': 'IAM Role\n',
      'Parameters': [
        {
          'ParameterKey': 'ResourcePrefix',
          'ParameterValue': 'NODECF-BOILERPLATE-'
        },
        {
          'ParameterKey': 'RoleName',
          'ParameterValue': 'IamRole-V2'
        },
        {
          'ParameterKey': 'ResourcePostfix',
          'ParameterValue': '-V2'
        }
      ],
      'CreationTime': '2019-03-26T19:02:52.311Z',
      'RollbackConfiguration': {},
      'StackStatus': 'CREATE_COMPLETE',
      'DisableRollback': true,
      'NotificationARNs': [],
      'Capabilities': [
        'CAPABILITY_NAMED_IAM'
      ],
      'Outputs': [
        {
          'OutputKey': 'RoleName',
          'OutputValue': 'IamRole-V2'
        },
        {
          'OutputKey': 'RoleArn',
          'OutputValue': 'arn:aws:iam::840742628714:role/IamRole-V2'
        }
      ],
      'Tags': [],
      'EnableTerminationProtection': false,
      'DriftInformation': {
        'StackDriftStatus': 'NOT_CHECKED'
      }
    }
  ]
}

export {
  CREATE_COMPLETE_RESPONSE
}
