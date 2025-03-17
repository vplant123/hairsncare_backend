const Joi = require('joi');


const patientstatus = {
    body: Joi.object().keys({

        name: Joi.string().required(),
        status: Joi.string().valid('treatment', 'check-up', 'other').required(),
        amount: Joi.number().required(),
        appointmentDate: Joi.date().iso().required(),
        paymentMethod: Joi.string().valid('card', 'upi').required(),
        paymentStatus: Joi.string().valid('pending', 'failed', 'success').required()

    })
}







module.exports = { patientstatus };
