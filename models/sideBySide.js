const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const sideBySideSchema = new mongoose.Schema(
  {
    order: {
      type: Number,
    },
    location: { type: String, required: true },
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
    header: {
      type: String,
    },
    content: {
      type: String,
    },
    background: {
      type: ObjectId,
      ref: "Media",
      required: true,
    },
    logo: {
      type: ObjectId,
      ref: "Media",
    },
    ctaText: {
      type: String,
    },
    ctaLink: {
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

module.exports = mongoose.model("SideBySide", sideBySideSchema);
