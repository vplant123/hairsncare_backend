const mongoose = require("mongoose")


const expertiseSchema = new mongoose.Schema(
  {
    section1: {
      //expertise banner
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
      //des number
      {
        num1: {
          type: String,
        },
        num2: {
          type: String,
        },
      },

    section3: {
      //Hair Transplant data
      title: {
        type: String,
      },
      data: [
        {
          img: {
            type: String,
          },
          title: {
            type: String,
          },
          desc: {
            type: String,
          },
        },
      ],
    },

    section4: {
      //Hair Loss Procedures data
      title: {
        type: String,
      },
      data: [
        {
          img: {
            type: String,
          },
          title: {
            type: String,
          },
          desc: {
            type: String,
          },
        },
      ],
    },

    section5: {
      //Other Procedures: data
      title: {
        type: String,
      },
      data: [
        {
          img: {
            type: String,
          },
          title: {
            type: String,
          },
          desc: {
            type: String,
          },
        },
      ],
    },

    section6: {
      //main: data
      img: {
        type: String,
      },
    },

    section7: [
      //footer desc data
      {
        title: {
          type: String,
        },
        desc: {
          type: String,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Expertise', expertiseSchema);