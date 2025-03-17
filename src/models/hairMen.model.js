const mongoose = require("mongoose");

const hairMenSchema = new mongoose.Schema({}, { strict: false });

const HairMen = mongoose.model("HairMen", hairMenSchema);

module.exports = HairMen;