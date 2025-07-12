// const mongoose = require('mongoose');

// const productSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   price: { type: Number, required: true },
//   description: {
//     type: String,
//     required: true,
//   },
//   kit: [
//     {
//       type: String,
//     },
//   ],
//   src: [
//     {
//       type: String,
//     },
//   ],
//   longDes: { type: String },
//   stock: { type: String },
//   discount: { type: String },

//   category: { type: String },
//   subCategory: { type: String },
//   gst: { type: Number },
//   expiryDate: { type: Date },
//   batchNo: { type: String },
//   mfgName: { type: String },
//   weight: { type: String },
//   height: { type: String },
//   width: { type: String },
//   hsn: { type: String },
//   filter: [{ type: String }],
//   highlights: { type: String },
//   shortDes: { type: String },
//   benefitsMain: { type: String },
//   productDisplay: { type: Boolean },
//   benefits: [
//     {
//       title: {
//         type: String,
//       },
//       desc: {
//         type: String,
//       },
//     },
//   ],
//   ingredientMain: { type: String },
//   zohoProductId: { type: String },
//   ingredient: [
//     {
//       title: {
//         type: String,
//       },
//       desc: {
//         type: String,
//       },
//     },
//   ],
//   faq: [
//     {
//       title: {
//         type: String,
//       },
//       desc: {
//         type: String,
//       },
//     },
//   ],
//   review: {
//     type: String,
//     default: "0"
//   },
//   metaTitle: {
//     type: String,
//   },
//   metaDesc: {
//     type: String,
//   },
//   metaSlug: {
//     type: String,
//   },
//   metaCanonical: {
//     type: String,
//   },
// }, { timestamps: true });

// const Product = mongoose.model('Product', productSchema);

// module.exports = Product;

const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 }, // Added min validation
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
    stock: { type: Number, min: 0 }, // Changed to Number, added min
    discount: { type: Number, min: 0, max: 100 }, // Changed to Number, added range
    category: { type: String },
    subCategory: { type: String },
    gst: { type: Number, min: 0 }, // Added min validation
    expiryDate: {
      type: Date,
      validate: {
        validator: function (value) {
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          tomorrow.setHours(0, 0, 0, 0);
          return value >= tomorrow;
        },
        message: "Expiry date must be at least tomorrow",
      },
    },
    batchNo: { type: String },
    mfgName: { type: String },
    
    weight: { type: Number, min: 0 }, // Changed to Number, added min
    height: { type: Number, min: 0 }, // Changed to Number, added min
    width: { type: Number, min: 0 }, // Changed to Number, added min
    hsn: { type: String },
    filter: [{ type: String }],
    highlights: { type: String },
    shortDes: { type: String },
    benefitsMain: { type: String },
    productDisplay: { type: Boolean },
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
    review: {
      type: Number, // Changed to Number, assuming it’s a rating
      default: 0, // Adjusted default to numeric
      min: 0, // Added validation
    },
    metaTitle: {
      type: String,
    },
    metaDesc: {
      type: String,
    },
    metaSlug: {
      type: String,
    },
    metaCanonical: {
      type: String,
    },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
