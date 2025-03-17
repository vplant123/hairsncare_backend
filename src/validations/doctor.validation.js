const Joi = require("joi");

const loginWithmobile = {
    body: Joi.object().keys({
        mobile: Joi.string().required(),



    })
}
const verifyotp = {
    body: Joi.object().keys({
        mobile: Joi.string().required(),
        otp: Joi.string().required(),
    })
}



module.exports = {
    loginWithmobile, verifyotp
}