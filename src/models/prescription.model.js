const mongoose = require("mongoose");

const prescriptionSchema = new mongoose.Schema(
  {},
  {
    strict: false,
    timestamps: true,
  }
);

const Prescription = mongoose.model("Prescription", prescriptionSchema);

module.exports = Prescription;
