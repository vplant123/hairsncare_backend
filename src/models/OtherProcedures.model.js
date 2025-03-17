const mongoose = require("mongoose");

const otherProceduresSchema = new mongoose.Schema({}, { strict: false });

const OtherProcedures = mongoose.model("OtherProcedures", otherProceduresSchema);

module.exports = OtherProcedures;