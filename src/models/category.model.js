const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: {
        type: String,
        required: true
    },
    kit : [{
        type: String,
      }],
    src: {
        type: String,
    },
    longDes : {type: String,},
    productDisplay:{type : Boolean},
    stock : {type: String,},
    userReview : [{type: String}],
    discount : {type: String,},
});

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    products: [productSchema]
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
