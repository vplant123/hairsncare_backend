const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// const bcrypt = require("bcrypt");


const doctorSchema = new Schema(

    {
        email: {
            type: String,
            // required: true
        },
        userId : {
            type: String,
            // required: true
        },
        name: {
            type: String,
            // required: true,
            unique: true,
        },
        phone: {
            type: String,
            // required: true,
        },
        specialist: {
            type: String,

        },
        address: {
            type: String,
        },
        image: {
            type: String,
        },
        degree: {
            type: String,
        },
        experience: {
            type: String
        },
        language: {
            type: String
        },
        expertise: [{
            type: String
        }],
        description: {
            type: String,
        },
        qualification: {
            type: String,
        },
        awards: [{
            type: String,
        }],
        isSpec: {
            type : Boolean,
        },
        isActive:{
            type : Boolean,
            default: true
        }
    }, { timestamps: true }
)

const Doctors = mongoose.model("Doctors", doctorSchema)

module.exports = Doctors;

