const mongoose = require("mongoose");

const jobPostingSchema = new mongoose.Schema(
  {
    order: {
      type: Number,
    },
    status: {
      type: Boolean,
      default: false,
    },
    position: {
      type: String,
      required: true,
    },
    company: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    requirements: {
      type: String,
      required: true,
    },
    destinationURL: {
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

module.exports = mongoose.model("JobPosting", jobPostingSchema);
