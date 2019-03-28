import crypto from 'crypto'
import _ from 'lodash'

const createHash = (data) => {
  return crypto.createHash('md5').update(typeof data === 'object' ? JSON.stringify(data) : data).digest('hex')
}

const getNullIfEmptyOrUndefined = (value) => {
  return (
    _.isEmpty(_.trim(value)) ||
    _.isUndefined(value) ||
    _.isNull(value)
  ) ? null : value
}

const isNullOrEmptyOrUndefined = value =>
  getNullIfEmptyOrUndefined(value) === null || false

export {
  createHash,
  getNullIfEmptyOrUndefined,
  isNullOrEmptyOrUndefined
}
