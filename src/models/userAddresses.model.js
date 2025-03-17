const mongoose = require('mongoose');

const userAddressesSchema = new mongoose.Schema({
    userId: { type: String,required:true },
    name: { type: String },
    phone: { type: String },
    fullAdress: { type: String,required:true },
    pin: { type: String },
    city: { type: String },
    state: { type: String },
    email: { type: String },
});

const userAddresses = mongoose.model('userAddresses', userAddressesSchema);

module.exports = userAddresses;
