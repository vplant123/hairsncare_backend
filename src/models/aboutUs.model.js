const mongoose = require("mongoose");

const aboutUsSchema = new mongoose.Schema(
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
        img: {
          type: String,
        },
        title: {
          type: String,
        },
        shortDesc: {
          type: String,
        },
        longDesc: {
          type: String,
        },
      },

    section3: {
      //Hair Transplant data
      title: {
        type: String,
      },
      img: {
        type: String,
      },
      data: [
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

    section4: {
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

    section5: {
      //Hair Transplant data
      title: {
        type: String,
      },

      data: [
        {
          title: {
            type: String,
          },
          desc: {
            type: String,
          },
          img: {
            type: String,
          },
        },
      ],
    },

    section6: {
      //Hair Transplant data
      title: {
        type: String,
      },
      desc: {
        type: String,
      },

      data: [
        {
          title: {
            type: String,
          },
          desc: {
            type: String,
          },
          icon: {
            type: String,
          },
        },
      ],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AboutUs", aboutUsSchema);
