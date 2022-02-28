const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const heroSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
    },
    slug: {
      type: String,
      reguired: true,
      index: true,
      unique: true,
    },
    heroType: {
      type: String,
      required: true,
    },
    content: {
      type: String,
    },
    ctaText: {
      type: String,
    },
    ctaLink: {
      type: String,
    },
    videoURL: {
      type: String,
    },
    image: {
      type: ObjectId,
      ref: "Media",
    },
    background: {
      type: ObjectId,
      ref: "Media",
    },
    mobileBackground: {
      type: ObjectId,
      ref: "Media",
    },
    withLogo: {
      type: Boolean,
    },
    heroLocation: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Hero", heroSchema);
