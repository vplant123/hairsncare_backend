const mongoose = require("mongoose")


const contactScreenSchema = new mongoose.Schema(
  {
    section1: {
      image: {
        type: String,
      },
      title: {
        type: String,
      },
      description: {
        type: String,
      },
    },
    section2:
      {
        name: {
          type: String,
        },
        address: {
          type: String,
        },
        phone: {
          type: String,
        },
        email: {
          type: String,
        },
        time1: {
          type: String,
        },
        time2: {
          type: String,
        },
      },

    section3: {
      title: {
        type: String,
      },
      img: {
        type: String,
      },
      data: [
        {
          desc: {
            type: String,
          },
        },
      ],
    },

  },
  { timestamps: true }
);

module.exports = mongoose.model('contactScreen', contactScreenSchema);