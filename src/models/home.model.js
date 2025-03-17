const mongoose = require("mongoose")


const homeSchema = new mongoose.Schema(
  {
    section1: {
      //home banner
      socialImg: [
        {
          type: String,
        },
      ],
      data: [
        {
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
      ],
    },
    section2: 
      //review number
      {
        num1: {
          type: Number,
        },
        num2: {
          type: Number,
        },
        num3: {
          type: Number,
        },
        num4: {
          type: Number,
        },
      },

    section3: [
      //review images
      {
        name: {
          type: String,
        },
        rating: {
          type: String,
        },
        desc: {
          type: String,
        },
        time: {
          type: String,
        },
        img: {
          type: String,
        },
      },
    ],

    section4: {
      //trust data
      title: {
        type: String,
      },
      desc: {
        type: String,
      },
      data: [
        {
          icon: {
            type: String,
          },
          text: {
            type: String,
          },
        },
      ],
    },

    section5: [
      //publish data
      {
        img: {
          type: String,
        },
      },
    ],

    section6: {
      //core principal data
      mainDes: {
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

    section7: {
      //hair analysis data
      title: {
        type: String,
      },
      img: {
        type: String,
      },
      desc: {
        type: String,
      },
    },

    section8: {
      //hair blueprint data
      mainTitle: {
        type: String,
      },
      img: {
        type: String,
      },
      title1: {
        type: String,
      },
      title2: {
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
      subImg : {
        type: String,
      },
    },

    section9: [
      //shipping data
      {
        name: {
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

    section10: {
      title: {
        type: String,
      },
      data: [
        //before after data
        {
          img1: {
            type: String,
          },
          img2: {
            type: String,
          },
        },
      ],
    },

    section11: [
      //video data
      {
        url: {
          type: String,
        },
        youtube: {
            type: String,
          }
      },
    ],
    section12 : {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Home', homeSchema);