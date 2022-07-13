const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const companyShowcase = new mongoose.Schema(
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
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    content: {
      type: String,
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

module.exports = mongoose.model("CompanyShowcase", companyShowcase);
