const Validator = require('validator');
const isEmpty = require('./is-empty');

module.exports = function validatePlanInput(data) {
  let errors = {};

  data.title = !isEmpty(data.title) ? data.title : '';
  data.startDate = !isEmpty(data.startDate) ? data.startDate : '';
  data.endDate = !isEmpty(data.endDate) ? data.endDate : '';

  if (!Validator.isISO8601(data.startDate)) {
    errors.startDate = 'Start date must be a valid Date';
  }

  if (!Validator.isISO8601(data.endDate)) {
    errors.endDate = 'End date must be a valid Date';
  }


  return {
    errors,
    isValid: isEmpty(errors)
  };
};