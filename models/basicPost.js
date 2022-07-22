const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const basicPostSchema = new mongoose.Schema(
  {
    order: {
      type: Number,
    },
    location: {
      type: String,
      required: true,
    },
    status: {
      type: Boolean,
      default: false,
    },
    publishDate: {
      type: Date,
    },
    title: {
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
    },
    previewImage: {
      type: ObjectId,
      ref: "Media",
    },
    displayImage: {
      type: ObjectId,
      ref: "Media",
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

module.exports = mongoose.model("BasicPost", basicPostSchema);
