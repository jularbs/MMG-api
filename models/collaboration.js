const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const collaborationSchema = new mongoose.Schema(
  {
    order: {
      type: Number,
    },
    company: {
      type: String,
      required: true,
    },
    campaign: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
    },
    cover: {
      type: ObjectId,
      ref: "Media",
    },
    videoSource: {
      type: String,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Collaboration", collaborationSchema);
