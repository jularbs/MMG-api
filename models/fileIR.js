const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const fileIRSchema = new mongoose.Schema(
  {
    asOf: {
      type: String,
    },
    categort: {
      type: ObjectId,
      ref: "CategoryIR",
    },
    file: {
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

module.exports = mongoose.model("FileIR", fileIRSchema);
