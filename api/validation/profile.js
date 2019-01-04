const Validator = require('validator');
const isEmpty = require('./is-empty');

module.exports = function validateProfileInput(data) {
  let errors = {};

  data.handle = !isEmpty(data.handle) ? data.handle : '';
  data.firstName = !isEmpty(data.firstName) ? data.firstName : '';
  data.lastName = !isEmpty(data.lastName) ? data.lastName : '';

  if (!Validator.isLength(data.handle, { min: 4, max: 40 })) {
    errors.handle = 'Handle needs to between 4 and 40 characters';
  }

  if (Validator.isEmpty(data.handle)) {
    errors.handle = 'Profile handle is required';
  }
  if (Validator.isEmpty(data.firstName)) {
    errors.firstName = 'First Name is required';
  }
  if (Validator.isEmpty(data.lastName)) {
    errors.lastName = 'Last Name (or initial) is required';
  }
  if (/\s/.test(data.handle)) {
    errors.handle = 'Handle cannot contain spaces'
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};