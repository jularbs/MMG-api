const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const metricsSchema = new mongoose.Schema(
  {
    order: {
      type: Number,
    },
    label: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    figures: {
      type: String,
      required: true,
    },
    suffix: {
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

module.exports = mongoose.model("Metric", metricsSchema);
