const Joi = require("joi");

const createDoctor = {
  body: Joi.object().keys({
    email: Joi.string()
      .custom((value, helpers) => {
        if (
          !/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/.test(value)
        ) {
          return helpers.message(`${value} is not a valid email address!`);
        }
        return value;
      })
      .required(),

    name: Joi.string().required(),

    phone: Joi.string().required(),
    specialist: Joi.string().required(),
    address: Joi.string().required(),
    image: Joi.string().optional(),
    degree: Joi.string().required(),
    experience: Joi.string().required(),
    language: Joi.string().required(),
    expertise: Joi.required(),
    awards: Joi.required(),
    description: Joi.string().required(),
    qualification: Joi.string().required(),
    isSpec: Joi.required(),
    showOnDashboard: Joi.boolean().optional(),
  }),
};

module.exports = {
  createDoctor,
};
