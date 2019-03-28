
import { createHash } from '../misc.util';

describe('Test miscellaneous utils', () => {
  test('create hash for string', async () => {
    const hash = createHash('Primal')
    expect(hash).toEqual('68123c95275511243def4b27f64f4d97')
  })

  test('create hash for Object', async () => {
    const hash = createHash({
      test: 1234
    })
    expect(hash).toEqual('85f19a3fde62c147af1ca8758c5071a8')
  })
})
