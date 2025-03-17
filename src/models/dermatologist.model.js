const mongoose = require("mongoose");

const dermatologistSchema = new mongoose.Schema({}, { strict: false });

const Dermatologist = mongoose.model("Dermatologist", dermatologistSchema);

module.exports = Dermatologist;
