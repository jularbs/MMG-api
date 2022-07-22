const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const testimonialSchema = new mongoose.Schema(
  {
    order: {
      type: Number,
    },
    location: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    position: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      unique: true,
      index: true,
      required: true,
    },
    image: {
      type: ObjectId,
      ref: "Media",
    },
    blurb: {
      type: String,
      required: true,
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

module.exports = mongoose.model("Testimonial", testimonialSchema);
