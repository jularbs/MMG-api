const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const simpleBusinessSchema = new mongoose.Schema(
  {
    order: {
      type: Number,
    },
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
    URL: {
      type: String,
      required: true,
    },
    background: {
      type: ObjectId,
      ref: "Media",
    },
    logo: {
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

module.exports = mongoose.model("SimpleBusiness", simpleBusinessSchema);
