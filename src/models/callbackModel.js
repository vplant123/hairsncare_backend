const mongoose = require("mongoose");

const callbackSchema = new mongoose.Schema(
  {
    event: { type: String, required: true },
    payload: { type: Object, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CallbackResponse", callbackSchema);