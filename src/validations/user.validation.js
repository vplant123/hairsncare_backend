// const Joi = require("joi");

// const register = {
//   body: Joi.object().keys({
//     email: Joi.string().custom((value, helpers) => {
//       if (!/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/.test(value)) {
//         return helpers.message(`${value} is not a valid email address!`);
//       }
//       return value;
//     }).required(),
//     password: Joi.string().custom((value, helpers) => {
//       if (!/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+}{"':;?/>.<,])(?=.*[a-zA-Z]).{8,}$/.test(value)) {
//         return helpers.message(`Password should be at least 8 characters, with at least one uppercase letter, one lowercase letter, one digit, and one special character.`);
//       }
//       return value;
//     }).required(),
//     fullname: Joi.string().required(),
//     // role: Joi.string().required(),
//     mobile: Joi.string().optional(),
//     // otp: Joi.string().required(),
//     // status: Joi.boolean().required()
//   })
// }
// // const login = {
// //   body: Joi.object().keys({
// //     email: Joi.string().custom((value, helpers) => {
// //       if (!/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/.test(value)) {
// //         return helpers.message(`${value} is not a valid email address!`);
// //       }
// //       return value;
// //     }).required(),
//     password: Joi.string().custom((value, helpers) => {
//       if (!/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+}{"':;?/>.<,])(?=.*[a-zA-Z]).{8,}$/.test(value)) {
//         return helpers.message(`Password should be at least 8 characters, with at least one uppercase letter, one lowercase letter, one digit, and one special character.`);
//       }
//       return value;
//     }).required(),
//     // role: Joi.string().required()
//   })

// }
// const forgotPass = {
//   body: Joi.object().keys({
//     email: Joi.string().custom((value, helpers) => {
//       if (!/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/.test(value)) {
//         return helpers.message(`${value} is not a valid email address!`);
//       }
//       return value;
//     }).required(),

//   })

// }
// const updatePass = {
//   body: Joi.object().keys({
//     email: Joi.string().custom((value, helpers) => {
//       if (!/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/.test(value)) {
//         return helpers.message(`${value} is not a valid email address!`);
//       }
//       return value;
//     }).required(),
//     newPassword: Joi.string().custom((value, helpers) => {
//       if (!/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+}{"':;?/>.<,])(?=.*[a-zA-Z]).{8,}$/.test(value)) {
//         return helpers.message(`Password should be at least 8 characters, with at least one uppercase letter, one lowercase letter, one digit, and one special character.`);
//       }
//       return value;
//     }).required(),
//     otp: Joi.string().required(),
//     otpCreatedAt: Joi.date().allow(null)

//   })
// }
// const changePass = {
//   body: Joi.object().keys({

//     newPassword: Joi.string().custom((value, helpers) => {
//       if (!/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+}{"':;?/>.<,])(?=.*[a-zA-Z]).{8,}$/.test(value)) {
//         return helpers.message(`Password should be at least 8 characters, with at least one uppercase letter, one lowercase letter, one digit, and one special character.`);
//       }
//       return value;
//     }).required(),
//     oldPassword: Joi.string().custom((value, helpers) => {
//       if (!/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+}{"':;?/>.<,])(?=.*[a-zA-Z]).{8,}$/.test(value)) {
//         return helpers.message(`Password should be at least 8 characters, with at least one uppercase letter, one lowercase letter, one digit, and one special character.`);
//       }
//       return value;
//     }).required(),
//   })

// }
// const bookAppointment = {
//   body: Joi.object().keys({
//     appointmentDate: Joi.string()
//       .required(),
//     timeSlot: Joi.string()
//       .required(),
//     planId: Joi.string().alphanum().length(24)
//       .required()
//   })

// }
// const addReview = {
//   body: Joi.object().keys({
//     rating: Joi.number().optional(),
//     comment: Joi.string().optional()

//   })

// }

// module.exports = {
//   register, login, forgotPass, updatePass, changePass, bookAppointment, addReview
// }