const mongoose = require("mongoose");

const configSchema = new mongoose.Schema({}, { strict: false });

const Config = mongoose.model("Config", configSchema);

module.exports = Config;