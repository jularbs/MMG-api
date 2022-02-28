const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const portraitSchema = new mongoose.Schema(
  {
    order: {
      type: Number,
    },
    location: { type: String, required: true },
    group: { type: String, required: true },
    name: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    position: {
      type: String,
    },
    description: {
      type: String,
    },
    image: {
      type: ObjectId,
      ref: "Media",
    },
    logo: {
      type: ObjectId,
      ref: "Media",
    },
    facebookURL: {
      type: String,
    },
    twitterURL: {
      type: String,
    },
    instagramURL: {
      type: String,
    },
    youtubeURL: {
      type: String,
    },
    tiktokURL: {
      type: String,
    },
    bigoLiveURL: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Portrait", portraitSchema);
