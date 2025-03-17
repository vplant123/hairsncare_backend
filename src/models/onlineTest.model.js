const mongoose = require("mongoose");

const onlineTestSchema = new mongoose.Schema({}, { strict: false });

const OnlineTest = mongoose.model("OnlineTest", onlineTestSchema);

module.exports = OnlineTest;
