const mongoose = require("mongoose");

const hairWomenSchema = new mongoose.Schema({}, { strict: false });

const HairWomen = mongoose.model("HairWomen", hairWomenSchema);

module.exports = HairWomen;