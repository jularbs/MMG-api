const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const optionSchema = new mongoose.Schema(
  {
    index: {
      type: String,
      required: true,
    },
    value: {
      type: String,
    },
    media: {
      type: ObjectId,
      ref: "Media",
    },
    meta: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Option", optionSchema);
