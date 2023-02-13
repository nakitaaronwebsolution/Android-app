
const Joi = require("joi");

const validator = (schema) => (payload) =>
    schema.validate(payload, { abortEarly: false });
const signupSchema = Joi.object({
    username: Joi.string().min(3).required(),
    role: Joi.string().required(),
    email: Joi.string().email().required(),
    date_of_birth: Joi.date().optional(),
    father_name: Joi.string().min(3).required(),
    mother_name: Joi.string().min(3).required(),
    blood_group: Joi.string().required(),
    address: Joi.string().required(),
    gender: Joi.string().required(),
    Adhar_number: Joi.string().min(12).max(12).required(),
    password: Joi.string().min(6).max(10).required(),
    contact_number: Joi.string().min(10).max(14).required(),
    retype_password: Joi.ref("password")
});
exports.validateSignup = validator(signupSchema);

const loginSchema = Joi.object({
    username: Joi.string().min(3).required(),
    password: Joi.string().min(6).max(10).required(),
})

exports.validatelogin = validator(loginSchema);