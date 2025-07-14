const mongoose = require("mongoose");

const customerVideosSchema = new mongoose.Schema(
  {
    section1: [
      {
        name: {
          type: String,
        },
        url: {
          type: String,
        },
        title: {
          type: String,
        },
        videoUrl: {
          type: String,
        },
      },
    ],
    appPrice1: {
      type: String,
    },
    appPrice2: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CustomerVideos", customerVideosSchema);
