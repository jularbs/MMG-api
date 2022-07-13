const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const categoryIRSchema = new mongoose.Schema(
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
    parent: {
      type: ObjectId,
      ref: "CategoryIR",
      default: null,
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

module.exports = mongoose.model("CategoryIR", categoryIRSchema);
