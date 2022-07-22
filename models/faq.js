const mongoose = require("mongoose");

const faqSchema = new mongoose.Schema(
  {
    order: {
      type: Number,
    },
    location: {
      type: String,
      required: true,
    },
    englishQuestion: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      unique: true,
      index: true,
      required: true,
    },
    englishAnswer: {
      type: String,
      required: true,
    },
    tagalogQuestion: {
      type: String,
    },
    tagalogAnswer: {
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

module.exports = mongoose.model("FAQ", faqSchema);
