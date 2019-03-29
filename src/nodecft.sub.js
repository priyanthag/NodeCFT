import _ from 'lodash'

/**
 * Stack processing is supported for only one stack
 * @param {*} data
 */
const _getProcessStackOutput = (data) => {
  return _.reduce(_.get(data, ['Stacks', 0, 'Outputs']), (result, value, key) => {
    _.set(result, _.get(value, 'OutputKey'), _.get(value, 'OutputValue'))
    return result
  }, {})
}

export {
  _getProcessStackOutput
}
