const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: {
    type: String,
    required: true,
  },
  kit: [
    {
      type: String,
    },
  ],
  src: [
    {
      type: String,
    },
  ],
  longDes: { type: String },
  stock: { type: String },
  discount: { type: String },



  category : { type: String },
  subCategory : { type: String },
  gst: { type: Number },
  expiryDate:{ type: Date },
  batchNo: { type: String },
  mfgName : { type: String },
  hsn : { type: String },
  weight : { type: String },
  height : { type: String },
  width : { type: String },
  
  highlights: { type: String },
  shortDes: { type: String },
  benefitsMain: { type: String },
  productDisplay:{type : Boolean},
  benefits: [
    {
      title: {
        type: String,
      },
      desc: {
        type: String,
      },
    },
  ],
  ingredientMain: { type: String },
  zohoProductId: { type: String },
  ingredient: [
    {
      title: {
        type: String,
      },
      desc: {
        type: String,
      },
    },
  ],
  faq: [
    {
      title: {
        type: String,
      },
      desc: {
        type: String,
      },
    },
  ],
  review : {
    type: String,
    default : "0"
  },
});


const cartSchema = new mongoose.Schema({
    cartId: { type: String },
    userId: { type: String },
    items: [
        {
          item: productSchema,
          quantity: {
            type: Number,
            default : 1
          },
        },
      ],
    showToUser : {
        type: Boolean,
      },
});

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
