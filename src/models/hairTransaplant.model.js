const mongoose = require("mongoose");

const hairTransplantSchema = new mongoose.Schema({}, { strict: false });

const HairTransplant = mongoose.model("HairTransplant", hairTransplantSchema);

module.exports = HairTransplant;
