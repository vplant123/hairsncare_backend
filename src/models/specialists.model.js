const mongoose = require("mongoose");

const specialistSchema = new mongoose.Schema(
  {
    section1: {
      //expertise banner
      image: {
        type: String,
      },
      title: {
        type: String,
      },
    },
    section2:
      //des number
      [
        {
          title: {
            type: String,
          },
          desc: {
            type: String,
          },
        },
      ],

    section3: {
      //Hair Transplant data
      name: {
        type: String,
      },
      img: {
        type: String,
      },
      degree: {
        type: String,
      },
      specialist: {
        type: String,
      },
      experience: {
        type: String,
      },
      experitise: [
        {
            type: String,
        },
      ],
      qualification: {
        type: String,
      },
      association: {
        type: String,
      },
      awards : [{
        type: String,
      }]
    },

    section4: {
      title: {
        type: String,
      },
      desc: {
        type: String,
      },
    },

    section5: {
      //Hair Transplant data
      title: {
        type: String,
      },
      desc: {
        type: String,
      },

      data: [
        {
          desc: {
            type: String,
          },
          img: {
            type: String,
          },
        },
      ],
    },

  },
  { timestamps: true }
);

module.exports = mongoose.model("Specialists", specialistSchema);
