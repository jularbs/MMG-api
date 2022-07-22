const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const historySchema = new mongoose.Schema(
  {
    order: {
      type: Number,
    },
    label: {
      type: String,
      required: true,
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
    excerpt: {
      type: String,
      required: true,
    },
    background: {
      type: ObjectId,
      ref: "Media",
    },
    image: {
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

module.exports = mongoose.model("History", historySchema);
