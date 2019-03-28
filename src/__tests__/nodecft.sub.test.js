
import { _getProcessStackOutput} from '../nodecft.sub';
import {CREATE_COMPLETE_RESPONSE} from '../_fixtures/aws-sdk/responses'
describe('Test NodeCFT Subfunctions', () => {
  test('processing stack output', async () => {
    const pRes = _getProcessStackOutput(CREATE_COMPLETE_RESPONSE)
    console.log(JSON.stringify(pRes, undefined, 2));
  })
})
